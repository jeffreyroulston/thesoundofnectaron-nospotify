import * as si from "./spotify-interface";
// import * as Questions from "./questions";
import * as THREE from 'three';
import UI from "./ui";
import ResourceManager from "./resource-manager";
import Graphics from "./graphics";

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
    private spotifyInterface: si.SpotifyInterface;
    // private graphics: Graphics = new Graphics();
    private resourceManager: ResourceManager = new ResourceManager();
    // private ui: UI = new UI(this.graphics);
    private ui: UI = new UI(this);
    private profile: si.UserProfile | undefined;
    private topArtists: si.Artist[] | undefined;
    // private answeredQuestions: Questions.Question[] = [];

    constructor() {
        this.spotifyInterface = new si.SpotifyInterface({ClientID: CLIENT_ID, RedirectURI: REDIRECT_URI, Scopes: SCOPES});

        // var cookie = document.cookie;
        // console.log(cookie, this.spotifyInterface.Authorized);

        // if (cookie == "showLanding" || cookie == "") {
        //     document.cookie = "showLanding"
        //     this.ui.showLanding();
        // } else {
        //     if (this.spotifyInterface.Authorized) {
        //         this.ui.startRounds();
        //         this.spotifyInterface.GetUserProfile();
        //         console.log(this.profile);
        //     } else {
        //         this.ui.showLanding();
        //     }
        // }

        // // we need these binds to make sure and 'this' in callbacks is bound to the correct object
        // this.spotifyInterface.OnAuthorisedListeners.push(this.OnAuthorised.bind(this));
        // this.spotifyInterface.OnDataListeners.push(this.OnUserData.bind(this));
        // this.spotifyInterface.OnErrorListeners.push(this.OnSpotifyInterfaceError.bind(this));

        // this.spotifyInterface.OnDataListeners.push(this.OnUserData.bind(this.ui));

        // this.ui.OnLoginPressed = this.Login;
        // this.ui.OnQuestionAnswered.push(this.QuestionAnswered.bind(this));

        // this.resourceManager.loadResourceByPath(HTMLImageElement, "assets/noise-tex.png").then(() => {
        //     this.graphics.onInitResources(this.resourceManager);
        // });

        // this below was just for testing
        // is also a great example for how to switch colour in the background
        // setInterval(() => {
        //     this.graphics.switchColor(new THREE.Color(Math.random(), Math.random(), Math.random()), 0.5);
        // }, 2000);
        
        // UI BINDINGS
        this.ui.OnLoginPressed = this.Login.bind(this);
        // this.ui.OnQuestionAnswered.push(this.QuestionAnswered.bind(this));
        // this.resourceManager.loadResourceByPath(HTMLImageElement, "")

        // console.log("app initialised", this.spotifyInterface);
    }

    public Login() {
        // kick it all off
        // called from UI
        console.log("spotify authorised?", this.spotifyInterface.Authorized);

        if (this.spotifyInterface.Authorized) {
            this.ui.loginSuccessful();
            this.spotifyInterface.GetUserProfile();
            console.log(this.profile);
        } else {
            this.spotifyInterface.GetAuthorization();
        }
    }

    // private QuestionAnswered(totalQuestions: number, questionNumber: number, question: Questions.Question) {
        // this is where we aggregate query parameters
        // once we have all questions i.e. TotalQuestions == QuestionNumber, we can get recommendations and make the playlist
        // and the ui will get the recommendations, and playlist information through the data callback
        
        // this.answeredQuestions.push(question);
        
        // if (totalQuestions >= questionNumber) {
            
        //     var artistIds = this.topArtists?.map(artist => artist.Id).slice(0, 5);
        //     var params: ({parameter: string, value: number})[] = [];
            
        //     // parse parameters
        //     this.answeredQuestions.forEach((question) => {
        //         if (question.answer !== undefined) {
        //             params.push({parameter: question.parameter, value: question.answer.value})
        //         }
        //     });

        //     // get spotify recommendation
        //     this.spotifyInterface.GetRecommendations({
        //         Count: 100, 
        //         SeedArtistIDs: artistIds,
        //         QueryParameters: params
        //     });
        // }
    // }

    private OnAuthorised(): void {
        // we can only really get these when we're authorised
        this.spotifyInterface.GetUserProfile();
        this.ui.loginSuccessful();
    }

    // most of this stuff is temporary, will hook up the proper handlers with the ui state
    public OnUserData(type: si.DataType, data: si.Data): void {

        switch (type) {
            case si.DataType.UserProfile:
            
                this.profile = (data as si.UserProfile);
                // console.log(this.profile);
                // // could pass through the profile here but I'm trying to keep everything as separated as possible
                // if (this.profile.images != null && this.profile.DisplayName != null) {
                //     this.ui.ShowUserData(this.profile.images[0], this.profile.DisplayName);
                // }

                
                // this.spotifyInterface.GetTopArtists();
                break;

            // when we get recommendations back, we can automatically create the new playlist
            case si.DataType.Recommendations:

                var recommendations = (data as si.Track[]);
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

            case si.DataType.TopArtists:
                this.topArtists = (data as si.Artist[]);
                break;
        }
    }

    public OnSpotifyInterfaceError(type: si.ErrorType, data?: any) {
        console.log(type.toString());
        console.log(data);
    }
}

const app: App = new App();
