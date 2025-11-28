import {
  Component,
  OnInit,
  ViewEncapsulation,
  Inject,
  NgZone
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
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
import { Plugin as PMPlugin } from "prosemirror-state";
import { TextSelection } from "prosemirror-state";
import {
  tableNodes,
  tableEditing,
  columnResizing,
  addColumnAfter,
  addRowAfter,
  deleteTable,
  deleteColumn,
  deleteRow, 
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
  previewHtmlSafe!: SafeHtml;
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
    private zone: NgZone,
    private sanitizer: DomSanitizer
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
    const nodes = {
      ...basicNodes,
      image: basicNodes.image,
      ...tableNodeSpec
    };
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
    const highlightMark: MarkSpec = {
      attrs: { color: { default: '' } },
      parseDOM: [{
        tag: 'span[style]',
        getAttrs: (dom: any) => {
          const st = dom.getAttribute('style') || '';
          const bg = /background-color:\s*([^;]+)/.exec(st);
          return bg ? { color: bg[1].trim() } : false;
        }
      }],
      toDOM(mark: any) {
        const color = mark.attrs.color || '';
        return ['span', { style: `background-color:${color};` }, 0];
      }
    };
    const marks = {
      ...basicMarks,
      style: styleMark,
      highlight: highlightMark
    };
    const schema = new Schema({ nodes, marks });
    this.editor = new Editor({
      content: this.formTemplate || '',
      schema,
      plugins: [
        columnResizing(),
        tableEditing(),
        new PMPlugin({
          props: {
            handleDOMEvents: {
              mousedown: (view, event) => {
                const target = event.target as HTMLElement;
                if (!view.dom.contains(target)) return false;

                const pos = view.posAtCoords({
                  left: event.clientX,
                  top: event.clientY
                });
                if (target && target.tagName === 'IMG' && target.dataset['editorId']) {
                  const imgEl = target as HTMLImageElement;
                  const id = imgEl.dataset['editorId'];
                  this.selectedImageId = id || null;
                  this.imageWidth = imgEl.width || null;
                  this.imageHeight = imgEl.height || null;
                  if (pos) {
                    const tr = view.state.tr.setSelection(
                      TextSelection.create(view.state.doc, pos.pos)
                    );
                    view.dispatch(tr);
                  }
                  return false;
                }
                if (pos) {
                  const tr = view.state.tr.setSelection(
                    TextSelection.create(view.state.doc, pos.pos)
                  );
                  view.dispatch(tr);
                }
                return false;
              }
            }
          }
        }),
        new PMPlugin({
          appendTransaction(_, __, newState) {
            const doc = newState.doc;
            const last = doc.lastChild;
            if (last && last.type.name === 'paragraph') return null;
            const para = newState.schema.nodes['paragraph'].create();
            return newState.tr.insert(doc.content.size, para);
          }
        })
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
        // update safe preview HTML
        this.previewHtmlSafe = this.sanitizer.bypassSecurityTrustHtml(this.formTemplate || '');
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
  applyTextBackground(color: string) {
    const view = this.getView();
    if (!view) return;
    const { state, dispatch } = view;
    const { from, to } = state.selection;
    if (from === to) return;

    const markType = state.schema.marks.highlight;
    if (!markType) return;

    const mark = markType.create({ color });
    dispatch(state.tr.addMark(from, to, mark).scrollIntoView());
    view.focus();
    this.updateModelFromEditor();
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
      this.previewHtmlSafe = this.sanitizer.bypassSecurityTrustHtml(this.formTemplate || '');
    });
  }
  insertTable(rows = 3, cols = 3, withHeader = true): void {
    const view = this.getView();
    if (!view) return;
    const state = (view as any).state;
    const dispatch = ((view as any).dispatch && (view as any).dispatch.bind(view)) || ((tr: any) => (view as any).dispatch(tr));
    const schema = state?.schema;

    if (!state || !schema) {
      console.error('Editor view/state/schema not available; cannot insert table.');
      return;
    }
    const tableType = schema.nodes['table'];
    const rowType = schema.nodes['table_row'];
    const cellType = schema.nodes['table_cell'];
    const headerCellType = schema.nodes['table_header'];

    if (!tableType || !rowType || !cellType) {
      console.error('Table node types missing from schema; cannot insert table.');
      return;
    }
    const rowsNodes: any[] = [];
    for (let r = 0; r < rows; r++) {
      const cells: any[] = [];
      for (let c = 0; c < cols; c++) {
        const isHeader = withHeader && r === 0 && !!headerCellType;
        const cellParagraph =
          schema.nodes.paragraph.createAndFill() ||
          schema.nodes.paragraph.create(null, schema.text('\u2060'));
        const cellNode = (isHeader ? headerCellType : cellType).create(null, cellParagraph);
        cells.push(cellNode);
      }
      rowsNodes.push(rowType.create(null, cells));
    }

    const tableNode = tableType.create(null, rowsNodes);
    const tr = state.tr.replaceSelectionWith(tableNode).scrollIntoView();
    dispatch(tr);
    (view as any).focus();
    setTimeout(() => {
      const root = (view.dom as HTMLElement).querySelector('.NgxEditor__Content') as HTMLElement || (view.dom as HTMLElement);
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
          const pos = Math.max(1, state.selection.from);
          const resolved = state.doc.resolve(pos);
          const pmSelection = TextSelection.create(state.doc, resolved.start);
          dispatch(state.tr.setSelection(pmSelection));
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
    if (!root) return;
    const tables = Array.from(root.querySelectorAll('table'));
    if (!tables.length) return;

    tables.forEach((table) => {
      const t = table as HTMLElement;
      t.classList.add('prosemirror-table');
      t.style.setProperty('border-collapse', 'collapse', 'important');
      t.style.setProperty('border', `${this.borderWidth}px solid ${this.borderColor}`, 'important');
      t.style.width = t.style.width || '100%';
      t.querySelectorAll('th, td').forEach((cell: Element) => {
        const el = cell as HTMLElement;
        el.style.setProperty('border', `${this.borderWidth}px solid ${this.borderColor}`, 'important');
        el.style.setProperty('padding', '8px 10px', 'important');
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

  insertImageAtSelection(src: string, alt: string): void {
    const view = this.getView();
    if (!view) return;

    const { state, dispatch } = view;
    const schema = state.schema;

    const imageNodeType = schema.nodes['image'];
    if (!imageNodeType) {
      console.error("Image node missing from schema");
      return;
    }

    const uniqueId = 'img-' + Date.now();

    const imgNode = imageNodeType.create({
      src,
      alt,
      'data-editor-id': uniqueId,
      style: 'max-width:100%; height:auto; cursor:pointer;'
    });

    dispatch(state.tr.replaceSelectionWith(imgNode).scrollIntoView());

    // Select it immediately
    this.selectedImageId = uniqueId;
  }



  applyImageSize(width?: number | null, height?: number | null): void {
    if (!this.selectedImageId) {
      Swal.fire('No image selected', 'Please click an image first.', 'info');
      return;
    }
    const view = this.getView();
    if (!view) return;

    const { state, dispatch } = view;
    let imagePos = -1;
    state.doc.descendants((node: import('prosemirror-model').Node, pos: number) => {
      if (node.type.name === 'image' && node.attrs['data-editor-id'] === this.selectedImageId) {
        imagePos = pos;
      }
    });
    const node = state.doc.nodeAt(imagePos);
    if (!node) return;
    const existingStyle = node.attrs.style || '';
    const cleanedStyle = existingStyle
      .split(';')
      .filter((s: any) => s.trim() && !s.includes('width') && !s.includes('height'))
      .join('; ');

    const newStyle = [
      cleanedStyle,
      'cursor:pointer',
      'max-width:100%',
      width ? `width:${width}px` : '',
      height ? `height:${height}px` : 'auto'
    ].filter(Boolean).join('; ');

    dispatch(
      state.tr.setNodeMarkup(imagePos, undefined, { ...node.attrs, style: newStyle }).scrollIntoView()
    );
    this.zone.run(() => {
      this.imageWidth = width || null;
      this.imageHeight = height || null;
    });
  }
  resetImageSize(): void {
    if (!this.selectedImageId) return;
    const view = this.getView();
    if (!view) return;
    const { state, dispatch } = view;

    let imagePos = -1;

    state.doc.descendants((node: import('prosemirror-model').Node, pos: number) => {
      if (node.type.name === 'image' && node.attrs['data-editor-id'] === this.selectedImageId) {
        imagePos = pos;
      }
    });
    if (imagePos === -1) return;

    const node = state.doc.nodeAt(imagePos);
    if (!node) return;

    const existingStyle = node.attrs.style || '';
    const cleanedStyle = existingStyle
      .split(';')
      .filter((s: any) => s.trim() && !s.includes('width') && !s.includes('height'))
      .join('; ');

    const newStyle = [
      cleanedStyle,
      'cursor:pointer',
      'max-width:100%',
      'height:auto'
    ].filter(Boolean).join('; ');

    dispatch(
      state.tr.setNodeMarkup(imagePos, undefined, { ...node.attrs, style: newStyle }).scrollIntoView()
    );
    this.zone.run(() => {
      this.imageWidth = null;
      this.imageHeight = null;
    });
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
    this.previewHtmlSafe = this.sanitizer.bypassSecurityTrustHtml(html || '');
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
  deleteColumn(): void {
    const view = this.getView();
    if (!view) return;

    try {
      deleteColumn(view.state, view.dispatch);
    } catch (err) {
      console.error("deleteColumn failed", err);
    }

    setTimeout(() => {
      this.applyTableBorderStyling(view.dom as HTMLElement);
    }, 20);

    this.updateModelFromEditor();
  }
  deleteCell(): void {
    const view = this.getView();
    if (!view) return;

    const { state, dispatch } = view;
    const sel = state.selection;
    const $pos = sel.$from;

    const cellPos = $pos.start($pos.depth);
    const cellNode = $pos.node($pos.depth);

    if (!cellNode || (cellNode.type.name !== "table_cell" && cellNode.type.name !== "table_header")) {
      return;
    }
    const emptyPara = state.schema.nodes.paragraph.createAndFill();

    const tr = state.tr.replaceWith(
      cellPos + 1,
      cellPos + cellNode.nodeSize - 1,
      emptyPara
    );

    dispatch(tr.scrollIntoView());
    this.updateModelFromEditor();
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
