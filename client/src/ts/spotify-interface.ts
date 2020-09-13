export enum QueryParameters {
    Energy,
    Speechiness,
    Valence,
    Danceability,
    PlaylistLength,
}

export interface SpotifyInterfaceParams {
    ClientID: string;
    RedirectURI: string;
    Scopes: string[];
}

export interface RecommendationParams {
    Count?: number;
    SeedArtistIDs?: string[],
    QueryParameters?: {parameter: string, value: number}[];
}

export interface CreatePlaylistParams {
    UserId: string,
    Name: string,
    Description: string,
    Public?: boolean,
    TrackUris: string[],
    Image?: {
        Width: number,
        Height: number,
        Url: string,
    }
}

export type Data = Track[] | Artist[] | UserProfile | Playlist;

export enum DataType {
    TopArtists,
    Recommendations,
    UserProfile,
    PlaylistCreated
}

export interface Track {
    Name: string,
    Artists: Artist[],
    Uri: string,
    Id: string,
    Length: number
}

export interface Playlist { }

export interface Artist {
    Name: string,
    Id: string,
    Uri: string
}

export interface UserProfile {
    DisplayName: string;
    Uri: string;
    id: string;
    images: string[]
}

export enum ErrorType {
    NoAuthToken,
    StatusError,
    JsonParseError
}

export class SpotifyInterface {

    // endpoints
    private static AUTHORIZATION_ADDRESS: string = "https://accounts.spotify.com/authorize";
    private static USER_PROFILE_ADDRESS: string = "https://api.spotify.com/v1/me"; 
    private static TOP_ARTISTS_ADDRESS: string = "https://api.spotify.com/v1/me/top/artists";
    private static RECOMMENDATIONS_ADDRESS: string = "https://api.spotify.com/v1/recommendations";
    private static PLAYLIST_CREATION_ADDRESS: string ='https://api.spotify.com/v1/users/{user_id}/playlists';
    private static PLAYLIST_UPDATE_ADDRESS: string = 'https://api.spotify.com/v1/playlists/{playlist_id}/tracks';
    private static PLAYLIST_UPDATE_IMAGE_ADDRESS: string = 'https://api.spotify.com/v1/playlists/{playlist_id}/images';

    private token: string | undefined;
    private params: SpotifyInterfaceParams;

    public OnAuthorisedListeners: {(): void} [] = [];
    public OnDataListeners: {(type: DataType, data: Data): void}[] = [];
    public OnErrorListeners: {(type: ErrorType, data?: any): void}[] = [];

    public sessionAuthorised : boolean = false;

    constructor(params: SpotifyInterfaceParams) {
        this.params = params;

        console.log("window hash:", window.location.hash);

        // get the token
        this.token = window.location.hash.substr(1).split('&')[0].split("=")[1];
    }

    public get Authorized(): boolean {
        return this.token !== undefined;
    }

    public GetAuthorization(): void {

        // if the token doesn't exist, redirect to the spotify login page
        // TODO: use cookies to store tokens so we don't have to reauth all the time
        // TODO: do a simple api request to make sure our token is still good from cookies
        // otherwise we will need to reauth
        if (this.token === undefined) {

            console.log(this.params);

            // build url in a nice clean way
            const scopes = this.params.Scopes.join(" ");
            const url = new URL(SpotifyInterface.AUTHORIZATION_ADDRESS);
            url.searchParams.append("client_id", this.params.ClientID);
            url.searchParams.append("redirect_uri", this.params.RedirectURI);
            url.searchParams.append("scope", scopes);
            url.searchParams.append("response_type", "token");
            url.searchParams.append("show_dialog", "false");
            
            // we could do this or we could do a pop up window
            // I like this style of auth window better, popups can be annoying and we have to redirect anyway
            window.location.href = url.href;
        }

        // the token exists, so we're good to go with the rest of the app
        // broadcast the authorisation to all listeners
        else {
            this.OnAuthorisedListeners.forEach((callback) => {
                callback();
            });
        }
    }

    private BuildAuthToken(): string | undefined {
        if (this.token !== undefined) {
            return `Bearer ${this.token}`;
        }

        return undefined;
    }

    public GetUserProfile(): void {
        console.log("Get user profile")
        const auth = this.BuildAuthToken();

        // we shouldn't be calling these functions without a valid auth token
        if (auth === undefined) {

            // broadcast error
            this.OnErrorListeners.forEach((callback) => {
                callback(ErrorType.NoAuthToken);
            });

            // don't continue with the rest of the fetch
            return;
        }

        fetch(SpotifyInterface.USER_PROFILE_ADDRESS, {headers: {'Authorization': auth}})
        .then((response: Response) => {

            // something has gone wrong so broadcast error 
            if (!response.ok) {
                this.OnErrorListeners.forEach((callback) => {
                    callback(ErrorType.StatusError, {code: response.status, text: response.statusText});
                });
            }

            // no errors so continue on
            else {

                response.json().then((json) => {

                    // get all images attached with the profile
                    const possibleImages = json["images"];
                    const imageURLs: string[] = [];

                    // have to strict null check in typescript
                    if (possibleImages !== null) {
                        possibleImages.forEach((image: any) => {
                            imageURLs.push(image["url"]);
                        });
                    }

                    // if these exist, they will be added to the user profile
                    const profile: UserProfile = {
                        DisplayName: json["display_name"],
                        Uri: json["uri"],
                        id: json["id"],
                        images: imageURLs
                    }

                    // broadcast to listeners
                    this.OnDataListeners.forEach(callback => {
                        callback(DataType.UserProfile, profile);
                    });
                
                // json parse error
                }).catch((jsonError) => {
                    // broadcast error
                    this.OnErrorListeners.forEach((callback) => {
                        callback(ErrorType.JsonParseError);
                    });
                });
            }

        // network error maybe? not sure about this one
        }).catch((rejected) => {
            console.log(rejected);

        });
    }

    public GetTopArtists() {

        const auth = this.BuildAuthToken();

        // we shouldn't be calling these functions without a valid auth token
        if (auth === undefined) {

            // broadcast error
            this.OnErrorListeners.forEach((callback) => {
                callback(ErrorType.NoAuthToken);
            });

            // don't continue with the rest of the fetch
            return;
        }

        fetch(SpotifyInterface.TOP_ARTISTS_ADDRESS, {headers: {'Authorization': auth}})
        .then((response: Response) => {

            // something has gone wrong so broadcast error 
            if (!response.ok) {
                this.OnErrorListeners.forEach((callback) => {
                    callback(ErrorType.StatusError, {code: response.status, text: response.statusText});
                });
            }

            else {

                response.json().then((json) => {

                    // DEBUG
                    //console.log(json);
    
                    // artists come in an array called items
                    const items = json["items"];
                    if (items !== null) {
                        const artists: Artist[] = [];
    
                        // get all artist information
                        items.forEach((artist: any) => {
                            artists.push({Name: artist["name"], Id: artist["id"], Uri: artist["uri"]});
                        });
    
                        // broadcast artist information to listeners
                        this.OnDataListeners.forEach((callback) => {
                            callback(DataType.TopArtists, artists);
                        });
                    }

                // json parse error
                }).catch((jsonError) => {

                    // broadcast error
                    this.OnErrorListeners.forEach((callback) => {
                        callback(ErrorType.JsonParseError);
                    });
                });
            }

        // network error
        }).catch((rejected) => {
            
            console.log(rejected);

        });
    }

    public GetRecommendations(params: RecommendationParams): void {

        const auth = this.BuildAuthToken();

        // we shouldn't be calling these functions without a valid auth token
        if (auth === undefined) {

            // broadcast error
            this.OnErrorListeners.forEach((callback) => {
                callback(ErrorType.NoAuthToken);
            });

            // don't continue with the rest of the fetch
            return;
        }

        const url = new URL(SpotifyInterface.RECOMMENDATIONS_ADDRESS);

        if (params.SeedArtistIDs) {

            let artistSeeds = params.SeedArtistIDs;

            // enforce size limits
            artistSeeds = artistSeeds.slice(0, 5);
            
            let artistsString = params.SeedArtistIDs.join(',');
            url.searchParams.append("seed_artists", artistsString);
        }

        if (params.Count) {
            url.searchParams.append("limit", params.Count.toString());
        }

        if (params.QueryParameters) {

            // iterate query params
            params.QueryParameters.forEach((queryParam) => {

                let queryKey = queryParam.parameter;

                // check to make sure target is there
                if (!queryKey.startsWith("target_")) {
                    queryKey = `target_${queryKey}`;
                }

                url.searchParams.append(queryKey, queryParam.value.toString());
            });
        }

        // TODO: consider setting market to NZ
        
        //console.log(url.href);

        fetch(url.href, {headers: {'Authorization': auth}})
        .then((response: Response) => {
            
            // something has gone wrong so broadcast error 
            if (!response.ok) {
                this.OnErrorListeners.forEach((callback) => {
                    callback(ErrorType.StatusError, {code: response.status, text: response.statusText});
                });
            }

            else {

                response.json().then((json) => {

                    // DEBUG
                    console.log(json);

                    // check for tracks
                    const tracks = json.tracks;
                    if (tracks != null) {

                        const recommendations: Track[] = [];

                        // iterate tracks
                        tracks.forEach((track: any) => {
                            
                            // get all the tracks artists
                            const trackArtists: Artist[] = [];
                            track.artists.forEach((artist: any) => {
                                trackArtists.push({Name: artist.name, Id: artist.id, Uri: artist.uri});
                            });

                            // get the rest of the track data
                            recommendations.push({
                                Name: track.name,
                                Id: track.id,
                                Uri: track.uri,
                                Artists: trackArtists,
                                Length: track.duration_ms
                            });
                        });

                        // broadcast the recommendations
                        this.OnDataListeners.forEach((callback) => {
                            callback(DataType.Recommendations, recommendations);
                        });
                    }

                // json parse error
                }).catch((jsonError) => {

                    // broadcast error
                    this.OnErrorListeners.forEach((callback) => {
                        callback(ErrorType.JsonParseError, jsonError);
                    });
                });
            }

        // fetch error
        }).catch((rejected) => {
            
            console.log(rejected);

        });
    }

    public CreatePlaylist(params: CreatePlaylistParams): void {

        const auth = this.BuildAuthToken();

        // we shouldn't be calling these functions without a valid auth token
        if (auth === undefined) {

            // broadcast error
            this.OnErrorListeners.forEach((callback) => {
                callback(ErrorType.NoAuthToken);
            });

            // don't continue with the rest of the fetch
            return;
        }

        // build json body
        // public playlist is optional for now
        const jsonBody = {
            "name": params.Name,
            "description": params.Description,
            "public": params.Public ?? false
        }

        // need all these headers to POST a playlist
        const options = {
            headers: {
                'Authorization': auth,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonBody),
            method: 'POST'
        }

        const url = new URL(SpotifyInterface.PLAYLIST_CREATION_ADDRESS.replace("{user_id}", params.UserId));
        console.log(url.href);

        fetch(url.href, options).then((response) => {
            
            // continue and upload the songs
            if (response.ok) {

                // the json body will contain the id we need to continue updating the songs
                response.json().then((json) => {

                    // create the right url
                    const playlistId = json.id;
                    const playlistUrl = new URL(SpotifyInterface.PLAYLIST_UPDATE_ADDRESS.replace('{playlist_id}', playlistId));
                    
                    // build the uri query string
                    // taking care to make sure the uri has the correct prefix
                    const uriString = params.TrackUris.map(track => track.startsWith("spotify:track:") ? track : "spotify:track:" + track).join(',');
                    playlistUrl.searchParams.append("uris", uriString);
                    
                    const options = {
                        headers: {
                            'Authorization': auth,
                        },
                        method: 'POST'
                    }

                    fetch(playlistUrl.href, options).then((response) => {
                        
                        // we did it, we created the playlist
                        if (response.ok) {

                            // broadcast artist information to listeners
                            this.OnDataListeners.forEach((callback) => {

                                if (params.Image !== undefined) {
                                    this.SetPlaylistImage(playlistId, params.Image.Url);
                                }
                                // TODO: consider what playlist data to return
                                callback(DataType.PlaylistCreated, {});

                            });
                        }

                        // something went wrong uploading the songs
                        else {

                            // broadcast error
                            this.OnErrorListeners.forEach((callback) => {
                                callback(ErrorType.StatusError, {code: response.status, text: response.statusText});
                            });
                        }

                    // song upload fetch error
                    }).catch((rejected) => {
                        console.log(rejected);
                    });
                    
                // json parse error
                }).catch((jsonError) => {

                    // broadcast error
                    this.OnErrorListeners.forEach((callback) => {
                        callback(ErrorType.JsonParseError, jsonError);
                    });
                });
            }

            // error making playlist so dont upload songs
            else {

                // broadcast error
                this.OnErrorListeners.forEach((callback) => {
                    callback(ErrorType.StatusError, {code: response.status, text: response.statusText});
                });
            }

        // playlist creation fetch error
        }).catch((rejected) => {
            console.log(rejected);
        });
    }

    public SetPlaylistImage(playlist_id: string, imageUrl: string) {

        const img = new Image();
        img.onload = (imgData) => {
       
            let base64 = this.imgToBase64(img);

            if (base64 !== undefined) {
                base64 = base64.replace(/^data:image.+;base64,/, '');
                const auth = this.BuildAuthToken();
    
                if (auth === undefined) {
                    return;
                }
    
                const options = {
                    headers: {
                        'Authorization': auth,
                        'Content-Type': 'image/jpeg'
                    },
                    body: base64,
                    method: 'PUT'
                }
                
                const url = new URL(SpotifyInterface.PLAYLIST_UPDATE_IMAGE_ADDRESS.replace('{playlist_id}', playlist_id));
                fetch(url.href, options).then((response) => {
    
                });
            }
        }

        img.src = imageUrl;

        // fetch(imageUrl, imageOptions ).then( (response) => {

        //     response.arrayBuffer().then((buffer) => {
        //         const base64 = this.arrayBufferToBase64(buffer);

        //         const auth = this.BuildAuthToken();

        //         if (auth === undefined) {
        //             return;
        //         }

        //         const options = {
        //             headers: {
        //                 'Authorization': auth,
        //                 'Content-Type': 'image/jpeg'
        //             },
        //             body: image,
        //             method: 'PUT'
        //         }
                
        //         const url = new URL(SpotifyInterface.PLAYLIST_UPDATE_IMAGE_ADDRESS.replace('{playlist_id}', playlist_id));
        //         fetch(url.href, options).then((response) => {

        //         })
        //     });
        // });
    }

    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        var binary = '';
        var bytes = [].slice.call(new Uint8Array(buffer));
      
        bytes.forEach((b) => binary += String.fromCharCode(b));
      
        return window.btoa(binary);
    };

    private imgToBase64(img: HTMLImageElement): string | undefined {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (ctx === null) {
            return;
        }
        
        canvas.width = img.width;
        canvas.height = img.height;


      
        // I think this won't work inside the function from the console
        img.crossOrigin = 'anonymous';
      
        ctx.drawImage(img, 0, 0);
      
        return canvas.toDataURL();
      }
}

const image = "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"
