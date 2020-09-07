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
    Public?: boolean
    TrackUris: string[]
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

    private token: string | undefined;
    private params: SpotifyInterfaceParams;

    public OnAuthorisedListeners: {(): void} [] = [];
    public OnDataListeners: {(type: DataType, data: Data): void}[] = [];
    public OnErrorListeners: {(type: ErrorType, data?: any): void}[] = [];

    public sessionAuthorised : boolean = false;

    constructor(params: SpotifyInterfaceParams) {
        this.params = params;

        // console.log("window hash:", window.location.hash);

        // get the token
        // this.token = window.location.hash.substr(1).split('&')[0].split("=")[1];
        console.log("token", this.token);
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
            url.searchParams.append("show_dialog", "true");
            
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
}
