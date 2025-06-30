import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from "./page-template/header/header";
import { Loader } from "./page-template/loader/loader";
import { Footer } from "./page-template/footer/footer";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Loader, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'swaagat_2';

}
