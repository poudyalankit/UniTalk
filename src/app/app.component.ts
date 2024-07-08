import { Component } from '@angular/core';
import { Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'UniTalk';

  constructor(private meta: Meta) {
    this.updateMetaTags();
  }

  updateMetaTags() {
    this.meta.addTags([
      { name: 'description', content: 'UniTalk is an auto-translating chat platform that allows seamless communication across languages.' },
      { name: 'author', content: 'Ankit Poudyal' },
      { name: 'keywords', content: 'chat, translation, language, communication' },
      { property: 'og:image', content: 'https://i.imgur.com/LqfGBtB.png' },
    ]);
  }
}
