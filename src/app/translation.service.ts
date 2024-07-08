import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {

  private apiUrl = '/api';

  async translate(message: string, targetLanguage: string): Promise<string> {
    const url = `${this.apiUrl}/translate`;
    const params = {
      q: message,
      source: 'auto',
      target: targetLanguage
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }

      const data = await response.json();
      return data.translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  }

  async getLanguages(): Promise<any[]> {
    const url = `${this.apiUrl}/languages`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching languages:', error);
      throw error;
    }
  }
}
