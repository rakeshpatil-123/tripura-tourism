import {
  Component,
  OnInit,
  ViewEncapsulation,
  Inject,
  NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkSpec } from 'prosemirror-model';
import { FormsModule } from '@angular/forms';
import {
  NgxEditorMenuComponent,
  NgxEditorComponent,
  Editor,
  nodes as basicNodes,
  marks as basicMarks
} from 'ngx-editor';

import { Schema } from 'prosemirror-model';
import { TextSelection } from 'prosemirror-state';
import {
  tableNodes,
  tableEditing,
  columnResizing,
  addColumnAfter,
  addRowAfter,
  deleteTable,
  TableNodesOptions
} from 'prosemirror-tables';
import { ButtonModule } from 'primeng/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';

import jsPDF from 'jspdf';
import { GenericService } from '../../_service/generic/generic.service';

@Component({
  selector: 'app-service-certificate',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxEditorComponent, NgxEditorMenuComponent, ButtonModule],
  templateUrl: './service-certificate.component.html',
  styleUrls: ['./service-certificate.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ServiceCertificateComponent implements OnInit {
  public editor!: Editor;
  public toolbar = [
    ['bold', 'italic', 'underline', 'strike'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3'] }],
    ['link', 'image'],
    ['align_left', 'align_center', 'align_right', 'align_justify']
  ] as any;

  public borderColor = '#d8dbe0';
  public borderWidth = 1;
  formTemplate = '';
  selectedImageId: string | null = null;
  imageWidth: number | null = null;
  imageHeight: number | null = null;


  serviceId!: number;
  serviceName = 'Service';
  fontSize = 14;

  constructor(
    private genericService: GenericService,
    private dialogRef: MatDialogRef<ServiceCertificateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private zone: NgZone
  ) { }

  ngOnInit(): void {
    const tableNodeSpec = tableNodes({
      tableGroup: 'block',
      cellContent: 'block+',
      cellAttributes: {
        background: { default: null },
        colspan: { default: 1 },
        rowspan: { default: 1 },
        style: { default: null }
      }
    } as TableNodesOptions);
    const nodes = { ...basicNodes, ...tableNodeSpec };
    const styleMark: MarkSpec = {
      attrs: { style: { default: '' } },
      parseDOM: [{
        tag: 'span',
        getAttrs: (dom: any) => {
          const style = dom.getAttribute('style') || '';
          return { style };
        }
      }],
      toDOM: (mark: any) => ['span', { style: mark.attrs['style'] }, 0]
    };

    const marks = { ...basicMarks, style: styleMark };
    const schema = new Schema({ nodes, marks });
    this.editor = new Editor({
      content: this.formTemplate || '',
      schema,
      plugins: [
        columnResizing(),
        tableEditing()
      ]
    });
    const view = (this.editor as any)?.view;
    if (view && view.dom) {
      const clickHandler = (ev: MouseEvent) => {
        try {
          const target = ev.target as HTMLElement | null;
          if (!target) {
            this.zone.run(() => this.selectedImageId = null);
            return;
          }
          const imgEl = target.closest('img') as HTMLImageElement | null;

          if (imgEl && (view.dom as HTMLElement).contains(imgEl)) {
            let id = imgEl.getAttribute('data-editor-id');
            if (!id) {
              id = 'img_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
              imgEl.setAttribute('data-editor-id', id);
              imgEl.style.maxWidth = imgEl.style.maxWidth || '100%';
              imgEl.style.height = imgEl.style.height || 'auto';
              imgEl.style.cursor = imgEl.style.cursor || 'move';
              this.updateModelFromEditor();
            }

            this.zone.run(() => {
              this.selectedImageId = id;
              const wStyle = imgEl.style.width || '';
              const hStyle = imgEl.style.height || '';
              const w = (wStyle && wStyle.endsWith('px')) ? Number(wStyle.replace('px', '')) : (imgEl.width || null);
              const h = (hStyle && hStyle.endsWith('px')) ? Number(hStyle.replace('px', '')) : (imgEl.height || null);
              this.imageWidth = w || null;
              this.imageHeight = h || null;
            });
          } else {
            this.zone.run(() => {
              this.selectedImageId = null;
            });
          }
        } catch (err) {
          console.error('Editor click handler error', err);
        }
      };
      view.dom.addEventListener('click', clickHandler);
    }
    if (this.data) {
      this.serviceId = Number(this.data.service?.id || this.data.id || this.data.service_id);
      this.serviceName = this.data.service?.name || this.data.name || 'Unknown Service';
      if (this.serviceId) this.loadTemplate(this.serviceId);
    }
  }
  ngOnDestroy(): void {
    if (this.editor) this.editor.destroy();
  }

  private loadTemplate(serviceId: number): void {
    this.genericService.getServiceCertificateView(serviceId).subscribe({
      next: (res: any) => {
        this.formTemplate = res?.status === 1 ? res.data?.form_template || '' : '';
        if (this.editor) {
          try {
            (this.editor as any).setContent(this.formTemplate);
          } catch (e) {
          }
        }
      },
      error: (err: any) => console.error('Load template error', err)
    });
  }
  private getView() {
    return (this.editor as any)?.view;
  }
  private getEditorHTML(): string {
    if (typeof (this.editor as any)?.getHTML === 'function') {
      try { return (this.editor as any).getHTML(); } catch (e) { }
    }
    const view = this.getView();
    if (view && view.dom) {
      return view.dom.innerHTML;
    }
    return this.formTemplate || '';
  }
  private updateModelFromEditor() {
    this.zone.run(() => {
      this.formTemplate = this.getEditorHTML();
    });
  }
  insertTable(rows = 3, cols = 3, withHeader = true): void {
    const view = this.getView();
    if (!view) return;
    const { state, dispatch, schema } = view;

    const tableType = schema.nodes.table;
    const rowType = schema.nodes.table_row;
    const cellType = schema.nodes.table_cell || schema.nodes.tableCell || schema.nodes['table_cell'];
    const headerCellType = schema.nodes.table_header || schema.nodes.tableHeader || cellType;
    const rowsNodes: any[] = [];
    for (let r = 0; r < rows; r++) {
      const cells: any[] = [];
      for (let c = 0; c < cols; c++) {
        const isHeader = withHeader && r === 0;
        const cellParagraph = schema.nodes.paragraph.create(null, schema.text(''));
        const cellNode = (isHeader ? headerCellType : cellType).create(null, cellParagraph);
        cells.push(cellNode);
      }
      rowsNodes.push(rowType.create(null, cells));
    }

    const tableNode = tableType.create(null, rowsNodes);
    const tr = state.tr.replaceSelectionWith(tableNode).scrollIntoView();
    dispatch(tr);
    view.focus();
    setTimeout(() => {
      const root = view.dom as HTMLElement;
      this.applyTableBorderStyling(root);
      const firstCell = root.querySelector('table td, table th') as HTMLElement | null;
      if (firstCell) {
        const range = document.createRange();
        if (firstCell.firstChild) {
          range.setStart(firstCell.firstChild, 0);
        } else {
          range.setStart(firstCell, 0);
        }
        range.collapse(true);
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(range);
        }
        try {
          const docPos = view.state.doc;
          const tablePos = view.dom.querySelector('table') ? view.state.selection.from : view.state.selection.from;
          const resolved = view.state.doc.resolve(Math.max(1, view.state.selection.from));
          const textSel = TextSelection.create(view.state.doc, Math.max(0, resolved.start));
          dispatch(view.state.tr.setSelection(textSel));
        } catch (e) {
        }
      }
    }, 20);
    this.updateModelFromEditor();
  }



  addRow(): void {
    const view = this.getView();
    if (!view) return;
    try {
      addRowAfter(view.state, view.dispatch);
    } catch (e) {
      console.warn('addRow failed using command, falling back to DOM insertion', e);
    }

    setTimeout(() => {
      const root = view.dom as HTMLElement;
      this.applyTableBorderStyling(root);
    }, 20);

    this.updateModelFromEditor();
  }


  addColumn(): void {
    const view = this.getView();
    if (!view) return;
    try {
      addColumnAfter(view.state, view.dispatch);
    } catch (e) {
      console.warn('addColumn failed using command, falling back to DOM insertion', e);
    }

    setTimeout(() => {
      const root = view.dom as HTMLElement;
      this.applyTableBorderStyling(root);
    }, 20);


    this.updateModelFromEditor();
  }

  deleteTable(): void {
    const view = this.getView();
    if (!view) return;
    try {
      deleteTable(view.state, view.dispatch);
    } catch (e) {
      const sel = window.getSelection();
      if (sel && sel.anchorNode) {
        const el = this.findAncestorNode(sel.anchorNode, 'TABLE');
        if (el && el.parentElement) el.parentElement.removeChild(el);
      }
    }
    setTimeout(() => {
      const root = view.dom as HTMLElement;
      this.applyTableBorderStyling(root);
    }, 20);


    this.updateModelFromEditor();
  }

  private applyTableBorderStyling(root: HTMLElement) {
    const tables = Array.from(root.querySelectorAll('table'));
    if (!tables.length) return;

    tables.forEach((table) => {
      const t = table as HTMLElement;
      t.classList.add('prosemirror-table');
      t.style.borderCollapse = 'collapse';
      t.style.border = `${this.borderWidth}px solid ${this.borderColor}`;
      t.style.width = t.style.width || '100%';
      t.querySelectorAll('th, td').forEach((cell: Element) => {
        const el = cell as HTMLElement;
        el.style.border = `${this.borderWidth}px solid ${this.borderColor}`;
        el.style.padding = '8px 10px';
        el.style.verticalAlign = 'middle';
        if (!el.querySelector('p')) {
          const p = document.createElement('p');
          p.appendChild(document.createTextNode(''));
          el.appendChild(p);
        }
      });
    });
  }

  private findAncestorNode(node: Node | null, nodeName: string): HTMLElement | null {
    while (node && (node as HTMLElement).nodeName !== nodeName) {
      node = node.parentNode;
    }
    return node as HTMLElement | null;
  }

  private wrapSelectionWithSpan(style: string) {
    const view = this.getView();
    if (!view) return;

    const { state, dispatch } = view;
    const { from, to } = state.selection;
    if (from === to) return;

    const styleMarkType = state.schema.marks.style;
    if (!styleMarkType) return;
    const mark = styleMarkType.create({ style });
    dispatch(state.tr.addMark(from, to, mark).scrollIntoView());
    view.focus();
    this.updateModelFromEditor();
  }

  applyFontFamily(fontFamily: string) {
    if (!fontFamily) return;
    const view = this.getView();
    if (view && view.dom) (view.dom as HTMLElement).focus();
    this.wrapSelectionWithSpan(`font-family: ${fontFamily};`);
  }

  applyFontSize(size: string | number) {
    const s = Number(size) || this.fontSize;
    this.fontSize = s;
    const view = this.getView();
    if (view && view.dom) (view.dom as HTMLElement).focus();
    this.wrapSelectionWithSpan(`font-size: ${s}px;`);
  }

  applyTextColor(color: string) {
    if (!color) return;
    const view = this.getView();
    if (view && view.dom) (view.dom as HTMLElement).focus();
    this.wrapSelectionWithSpan(`color: ${color};`);
  }

  applyCellBackground(color: string) {
    if (!color) return;
    const sel = window.getSelection();
    if (!sel) return;
    const anchor = sel.anchorNode || sel.focusNode || null;
    if (!anchor) return;

    const cell = this.findAncestorNode(anchor, 'TD') || this.findAncestorNode(anchor, 'TH');
    if (cell) {
      (cell as HTMLElement).style.backgroundColor = color;
      (cell as HTMLElement).setAttribute('data-bg', color);
    }
    this.updateModelFromEditor();

  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input || !input.files || input.files.length === 0) return;
    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      Swal.fire('Invalid file', 'Please select an image file.', 'warning');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      this.insertImageAtSelection(dataUrl, file.name || 'image');
      input.value = '';
    };
    reader.readAsDataURL(file);
  }

  private insertImageAtSelection(src: string, alt = '') {
    const view = this.getView();
    if (!view) return;
    const { state, dispatch, schema } = view;
    const imageNodeType = schema.nodes.image || schema.nodes['image'];

    if (imageNodeType) {
      const imgNode = imageNodeType.create({
        src,
        alt,
        style: 'max-width:100%; height:auto; cursor:move;'
      });
      dispatch(state.tr.replaceSelectionWith(imgNode).scrollIntoView());
    } else {
      const paragraph = schema.nodes.paragraph.create(null, schema.text(''));
      dispatch(state.tr.replaceSelectionWith(paragraph).scrollIntoView());
    }
    const imgs = Array.from((view.dom as HTMLElement).querySelectorAll('img')) as HTMLImageElement[];
    const targetImg = [...imgs].reverse().find(img => !img.hasAttribute('data-editor-id'));
    if (targetImg) {
      const id = 'img_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
      targetImg.setAttribute('data-editor-id', id);
      targetImg.style.maxWidth = targetImg.style.maxWidth || '100%';
      targetImg.style.height = targetImg.style.height || 'auto';
      targetImg.style.cursor = targetImg.style.cursor || 'move';

      if (!targetImg.getAttribute('data-natural-width')) targetImg.setAttribute('data-natural-width', String(targetImg.naturalWidth || targetImg.width || ''));
      if (!targetImg.getAttribute('data-natural-height')) targetImg.setAttribute('data-natural-height', String(targetImg.naturalHeight || targetImg.height || ''));

      this.zone.run(() => {
        this.selectedImageId = id;
        this.imageWidth = targetImg.width || (targetImg.naturalWidth ? Number(targetImg.getAttribute('data-natural-width')) : null);
        this.imageHeight = targetImg.height || (targetImg.naturalHeight ? Number(targetImg.getAttribute('data-natural-height')) : null);
      });

      this.updateModelFromEditor();
    } else {
      this.updateModelFromEditor();
    }

  }

  applyImageSize(width?: number | null, height?: number | null) {
    if (!this.selectedImageId) {
      Swal.fire('No image selected', 'Please click the image inside the editor to select it first.', 'info');
      return;
    }
    const view = this.getView();
    if (!view) return;

    const img = view.dom.querySelector(`img[data-editor-id="${this.selectedImageId}"]`) as HTMLImageElement | null;
    if (!img) {
      Swal.fire('Image not found', 'Selected image could not be found in the editor DOM.', 'error');
      return;
    }

    if (width && width > 0) {
      img.style.width = `${width}px`;
    } else {
      img.style.removeProperty('width');
    }

    if (height && height > 0) {
      img.style.height = `${height}px`;
    } else {
      img.style.removeProperty('height');
    }

    this.zone.run(() => {
      this.imageWidth = img.style.width ? Number(img.style.width.replace('px', '')) : (img.width || null);
      this.imageHeight = img.style.height ? Number(img.style.height.replace('px', '')) : (img.height || null);
    });
    this.updateModelFromEditor();
  }
  resetImageSize() {
    if (!this.selectedImageId) return;
    const view = this.getView();
    if (!view) return;
    const img = view.dom.querySelector(`img[data-editor-id="${this.selectedImageId}"]`) as HTMLImageElement | null;
    if (!img) return;
    img.style.removeProperty('width');
    img.style.removeProperty('height');
    img.style.height = 'auto';
    this.zone.run(() => {
      this.imageWidth = null;
      this.imageHeight = null;
    });
    this.updateModelFromEditor();
  }

  insertLink(href: string) {
    if (!href) return;
    const view = this.getView();
    if (!view) return;
    const { state, dispatch } = view;
    const { from, to } = state.selection;
    if (from === to) return;

    const linkMark = state.schema.marks.link || state.schema.marks['link'];
    if (!linkMark) {
      console.warn('Schema does not contain a link mark');
      return;
    }
    dispatch(state.tr.addMark(from, to, linkMark.create({ href })).scrollIntoView());
    view.focus();
    this.updateModelFromEditor();
  }

  removeInlineStyles() {
    const sel = window.getSelection();
    const view = this.getView();
    if (sel && sel.rangeCount > 0 && sel.toString().length > 0) {
      const range = sel.getRangeAt(0);
      const text = range.toString();
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    } else if (view && view.dom) {
      const html = view.dom.innerHTML;
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      Array.from(tmp.querySelectorAll('[style]')).forEach(el => el.removeAttribute('style'));
      view.dom.innerHTML = tmp.innerHTML;
    }
    this.updateModelFromEditor();
  }
  getValue(event: Event): string {
    const target = event?.target as (HTMLInputElement | HTMLSelectElement | null);
    return target ? (target.value ?? '') : '';
  }
  getNumberValue(event: Event): number {
    const val = this.getValue(event);
    const n = Number(val);
    return isNaN(n) ? this.fontSize : n;
  }
  closeDialog(): void {
    try {
      const wrapper = document.querySelector('.certificate-wrapper') as HTMLElement | null;
      if (wrapper) {
        wrapper.classList.add('exit');
        setTimeout(() => {
          this.dialogRef.close();
        }, 200);
      } else {
        this.dialogRef.close();
      }
    } catch (e) {
      this.dialogRef.close();
    }
  }
  onContentChange(html: string): void {
    this.formTemplate = html;
  }

  saveTemplate(): void {
    const payload = { service_id: this.serviceId, form_template: this.formTemplate };
    this.genericService.generateServiceCertificateGenerate(payload).subscribe({
      next: (res: any) => {
        if (res?.status === 1) {
          Swal.fire('Saved', 'Template saved successfully', 'success');
          this.closeDialog();
        } else {
          Swal.fire('Error', 'Save failed', 'error');
        }
      },
      error: (err: any) => {
        console.error('Save error', err);
        Swal.fire('Error', 'Unexpected error occurred while saving', 'error');
      }
    });
  }

  previewTemplate(): void {
    const previewWindow = window.open('', '_blank', 'width=900,height=700');
    if (previewWindow) {
      previewWindow.document.open();
      previewWindow.document.write(`
    <html>
      <head>
        <title>Preview - ${this.serviceName}</title>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #222; }
          .NgxEditor__Content table { width:100%; border-collapse: collapse; }
          .NgxEditor__Content table, .NgxEditor__Content th, .NgxEditor__Content td { border: 1px solid #ccc; padding: 6px; }
        </style>
      </head>
      <body class="NgxEditor__Content">${this.formTemplate}</body>
    </html>
  `);
      previewWindow.document.close();
    }
  }

  downloadTemplate(): void {
    const doc = new jsPDF('p', 'pt', 'a4');
    doc.html(this.formTemplate, {
      callback: (pdf) => pdf.save(`${this.serviceName || 'template'}.pdf`),
      margin: [20, 20, 20, 20],
      x: 10,
      y: 10,
      width: 570
    });
  }

}
