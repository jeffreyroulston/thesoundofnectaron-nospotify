import {SpotifyInterface, UserProfile, Artist, DataType, Data, Track, ErrorType} from "./spotify-interface";
import UI from "./ui";

let CLIENT_ID: string = 'c5a5170f00bf40e2a89be3510402947c';
let REDIRECT_URI: string = "http://localhost:8888";
let SCOPES: string[] = [
    'user-top-read', 
    'user-read-private', 
    'user-read-email', 
    'user-top-read', 
    'user-library-modify', 
    'playlist-modify-public',
    'playlist-modify-private'];

export default class App {
    private spotifyInterface: SpotifyInterface;
    private ui: UI = new UI(this);
    private profile: UserProfile | undefined;

    constructor() {
        this.spotifyInterface = new SpotifyInterface({ClientID: CLIENT_ID, RedirectURI: REDIRECT_URI, Scopes: SCOPES});

        // we need these binds to make sure and 'this' in callbacks is bound to the correct object
        this.spotifyInterface.OnAuthorisedListeners.push(this.OnAuthorised.bind(this));
        this.spotifyInterface.OnDataListeners.push(this.OnUserData.bind(this));
        this.spotifyInterface.OnErrorListeners.push(this.OnSpotifyInterfaceError.bind(this));

        // kick it all off
        this.spotifyInterface.GetAuthorization();
    }

    private OnAuthorised(): void {
        // we can only really get these when we're authorised
        this.spotifyInterface.GetUserProfile();

        this.ui.showLoggedIn();
    }

    // most of this stuff is temporary, will hook up the proper handlers with the ui state
    public OnUserData(type: DataType, data: Data): void {

        switch (type) {
            case DataType.UserProfile:
            
                this.profile = (data as UserProfile);
                console.log(this.profile);
                // could pass through the profile here but I'm trying to keep everything as separated as possible
                if (this.profile.images != null && this.profile.DisplayName != null) {
                    this.ui.ShowUserData(this.profile.images[0], this.profile.DisplayName);
                }

                
                this.spotifyInterface.GetTopArtists();
                break;

            case DataType.Recommendations:
                var recommendations = (data as Track[]);
                console.log(recommendations);

                // all this below is to build a playlist just over four hours
                const playlistLengthSeconds = 4 * 60 * 60;
                let trackCount = 0;
                let currentLengthSeconds = 0;
                for (trackCount = 0; trackCount <  recommendations.length; trackCount++) {
                    if (currentLengthSeconds < playlistLengthSeconds) {
                        currentLengthSeconds += recommendations[trackCount].Length / 1000;
                    }

                    else {
                        break;
                    }
                }

                // get only just enough tracks to make the playlist time limit
                const trackUris = recommendations.map(track => track.Uri).slice(0, trackCount);

                if (this.profile !== undefined) {
                    this.spotifyInterface.CreatePlaylist({
                        UserId: this.profile.id,
                        TrackUris: trackUris,
                        Name: "Nectaron",
                        Description: "Get a load of this ya jabronies",
                        Public: false
                    });
                }
     
                break;

            case DataType.TopArtists:
                var artists = (data as Artist[]);
                console.log(artists);
                var artistIds = artists.map(artist => artist.Id).slice(0, 5);

                // this.spotifyInterface.GetRecommendations({
                //     Count: 100, 
                //     SeedArtistIDs: artistIds,
                //     QueryParameters: [
                //         {parameter: "energy", value: 0.5}
                //     ]
                // });
                // break;
        }
    }

    public OnSpotifyInterfaceError(type: ErrorType, data?: any) {
        console.log(type.toString());
        console.log(data);
    }
}

const app: App = new App();
