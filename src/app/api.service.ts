import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as Papa from 'papaparse';
import { map } from 'rxjs/operators'; // Import catchError and map
import { Observable } from 'rxjs';
import { environment } from 'src/enviornment/enviornment.prod';

// movie.interface.ts
export interface Movie {
  image: string;
  title: string;
  imdbRating: string;
  link: string;
}

export interface MoviesResponse {
  topRatedIndian: Movie[];
  topRatedTamil: Movie[];
  topRatedTelugu: Movie[];
  // Add other properties if necessary
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;
  private apiKeystream = environment.apiKeystream;
  private apiHost = environment.apiHost;

  private apiUrl2 = environment.apiUrl2;
  private apiKey2 = environment.apiKey2; // Store this in environment variables ideally
  private data :any= [];

  private apiUrl3 = environment.apiUrl3;
  private httpOptions = {
    headers: new HttpHeaders({
      'x-rapidapi-key': environment.xrapidapikey,
      'x-rapidapi-host': environment.xrapidapikey,
    })
  };

  private rapidApiKey1 = environment.rapidApiKey1;
  private hollywoodUrl = environment.hollywoodApiUrl;
  private indianUrl = environment.indianUrl;

  




  constructor(private http: HttpClient) {}

  getShowAvailability(type: string, id: string): Observable<any> {
    const options = {
      headers: new HttpHeaders({
        'x-rapidapi-key': this.apiKeystream,
        'x-rapidapi-host': this.apiHost
      })
    };

    const url = `https://${this.apiHost}/shows/${type}/${id}`;
    return this.http.get(url, options);

  }

  getNetflixData(): Observable<any> 
  {
    return new Observable((observer) => {
      this.http.get('assets/netflix_titles.csv', { responseType: 'text' })
        .subscribe((data) => {
          Papa.parse(data, {
            header: true,
            complete: (result) => {
              observer.next(result.data);
              observer.complete();
            }
          });
        });
    });
  }

  // Method to fetch the top 10 movies from IMDb API
  // getTopMovies(): Observable<any> {
  //   return this.http.get(this.apiUrl, { headers: this.headers });
  // }


  getTrendingNews(topic: string, language: string, country: string): Observable<any> {
    const currentDate = this.getFormattedDate(); // Get the current date in mm/dd/yyyy format
    const headers = new HttpHeaders({
      'x-rapidapi-key': this.apiKey2,
      'x-rapidapi-host': environment.xrapidapihost1,
    });
    console.log("date:",currentDate);
    

    const url = `${this.apiUrl2}?date=${currentDate}&topic=${topic}&language=${language}&country=${country}`;
    return this.http.get(url, { headers });


}
// Helper function to format the date as mm/dd/yyyy
getFormattedDate(): string {
  const today = new Date();
  const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Get the month (January is 0)
  const day = today.getDate().toString().padStart(2, '0');           // Get the day
  const year = today.getFullYear();

  return `${month}/${day}/${year}`;  // Return formatted date as mm/dd/yyyy
}


//oscar winners

getOscarWinners(): Observable<any[]> {
  return this.http.get<any>(this.apiUrl3, this.httpOptions).pipe(
    map((response: any) => {
      const categories = [
        'Best Motion Picture of the Year',
        'Best Performance by an Actor in a Leading Role',
        'Best Performance by an Actress in a Leading Role',
        'Best Achievement in Directing'
      ];

      // Set 'award', 'category', and 'nominee' to 'any' explicitly
      return response.awards.flatMap((award: any) =>
        award.categories
          .filter((category: any) =>
            categories.includes(category.categoryName) &&
            category.nominations.some((nominee: any) => nominee.isWinner)
          )
          .map((category: any) =>
            category.nominations.find((nominee: any) => nominee.isWinner)
          )
      );
    })
  );
}

// // api.service.ts
// getTrendingNews(topic: string, language: string, country: string): Observable<any> {
//   const url = `${this.apiUrl}/v2/trendings?topic=${topic}&language=${language}&country=${country}&date=${this.getCurrentDate()}`;
//   return this.http.get(url).pipe(
//     map((response: any) => response.data), // Access the 'data' property
//     catchError((error) => {
//       console.error('Error fetching trending news:', error);
//       return of([]); // Return an empty array on error
//     })
//   );
// }

// // Helper method to get current date in 'yyyy-mm-dd' format
// private getCurrentDate(): string {
//   const today = new Date();
//   return today.toISOString().split('T')[0]; // e.g., '2024-10-14'
// }


// api.service.ts
getLatestIndianMovies(): Observable<any> {
  const apiKey = environment.apiKey // Replace with your TMDb API key
  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=en-US&sort_by=release_date.desc&with_watch_providers=8&watch_region=IN&with_original_language=hi&primary_release_date.gte=2024-07-21`;

  return this.http.get<any>(url);
}

// getWatchlist(userId: string): Observable<any> {
//   return this.http.get<any>(`${this.apiUrl}/watchlist/${userId}`);
// }


// Function to add a movie to the watchlist
addToWatchlist(userId:string,watchlistPayload: {movieTitle: string; movieYear: number;movieRating: number }): Observable<any> {
  const url = `${this.apiUrl}/watchlist/${userId}`; // Your endpoint for adding to watchlist
  const headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  return this.http.post(url, watchlistPayload, { headers });
}

// Function to add a movie to the watchlist
// addToWatchlist1(userId:string,watchlistPayload: { movieTitle: string;movieYear: number; movieRating: number }): Observable<any> {
//   const url = `${this.apiUrl}/watchlist/${userId}`; // Your endpoint for adding to watchlist
//   const headers = new HttpHeaders({
//     'Content-Type': 'application/json'
//   });

//   return this.http.post(url, watchlistPayload, { headers });
// }


//movie reccomendations


fetchHollywoodMoviesByGenre(genre: string): Observable<any> {
  const headers = new HttpHeaders({
    'X-RapidAPI-Key': this.rapidApiKey1, // Replace with your actual API key
    'X-RapidAPI-Host': environment.XRapidAPIHost2,
  });
  const url = `${this.hollywoodUrl,{headers}}?genre=${genre}`; // Append genre as query param if needed
  return this.http.get<any>(url);
}

getMovies(): Observable<MoviesResponse> {
  const headers = new HttpHeaders({
    'X-RapidAPI-Key': this.rapidApiKey1, // Replace with your actual API key
    'X-RapidAPI-Host': environment.XRapidAPIHost2,
  });
  return this.http.get<MoviesResponse>(this.indianUrl,{headers})
  ;
}


deleteFromWatchlist(userId: string, movieTitle: string): Observable<any> {
  const url = `${this.apiUrl}/watchlist/${userId}/${movieTitle}`;
  return this.http.delete(url);
}
}