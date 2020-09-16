import * as si from "./spotify-interface";
// import * as Questions from "./questions";
import * as THREE from 'three';
import * as data from "./data";
import UI from "./ui";
import ResourceManager from "./resource-manager";
import Graphics from "./graphics";
import Landing from "./landing";
import Game from "./rounds";
import { easeExpIn } from "d3";
import { shuffle } from "./helpers";

let CLIENT_ID: string = 'c5a5170f00bf40e2a89be3510402947c';
// let REDIRECT_URI: string = "http://10.100.10.63:8888";
let REDIRECT_URI: string = "http://localhost:8888";
// let REDIRECT_URI: string = "http://thesoundofnectaron.truedigital.co.nz";
let SCOPES: string[] = [
    'user-top-read', 
    'user-read-private', 
    'user-read-email', 
    'user-top-read', 
    'user-library-modify', 
    'playlist-modify-public',
    'playlist-modify-private',
    'ugc-image-upload'];


export default class App {
    private spotifyInterface: si.SpotifyInterface;
    // private graphics: Graphics = new Graphics();
    private resourceManager: ResourceManager = new ResourceManager();
    // private ui: UI = new UI(this.graphics);
    private ui: UI = new UI(this);
    private profile: si.UserProfile | undefined;
    private topArtists: si.Artist[] | undefined;
    private topTracks: si.Track[] | undefined;
    // private answeredQuestions: Questions.Question[] = [];

    private requestedPlaylistLength: number = 120;

    constructor() {
        // console.log(window.location.href);

        this.spotifyInterface = new si.SpotifyInterface({ClientID: CLIENT_ID, RedirectURI: REDIRECT_URI, Scopes: SCOPES});

        this.ui.Login = this.Login.bind(this);

        // this.CheckAuthorization();

        // if (this.spotifyInterface.Authorized) {
        //     if (document.cookie == "landingShown") {
        //         this.ui.startRounds();
        //     } else {
        //         this.ui.showLanding();
        //     }
        // } else {
        //     this.ui.showLanding();
        // }

        // // we need these binds to make sure and 'this' in callbacks is bound to the correct object
        //this.spotifyInterface.OnAuthorisedListeners.push(this.OnAuthorised.bind(this));
        this.spotifyInterface.OnDataListeners.push(this.OnUserData.bind(this));
        this.spotifyInterface.OnErrorListeners.push(this.OnSpotifyInterfaceError.bind(this));

        // this.spotifyInterface.OnDataListeners.push(this.OnUserData.bind(this.ui));

        // this.ui.OnLoginPressed = this.Login;
        // this.ui.OnQuestionAnswered.push(this.QuestionAnswered.bind(this));

        // this.resourceManager.loadResourceByPath(HTMLImageElement, "assets/noise-tex.png").then(() => {
        //     this.graphics.onInitResources(this.resourceManager);
        // });

        this.getProfile();

        // transition finished callback here
        // this.graphics.transitionedCallback = () => {
        //     this.ui.bgTransitionComplete();
        // }
        // this below was just for testing
        // is also a great example for how to switch colour in the background
        // setInterval(() => {
        //     this.graphics.switchColor(new THREE.Color(Math.random(), Math.random(), Math.random()), 0.5);
        // }, 2000);
        
        // UI BINDINGS
        // this.ui.OnLoginPressed = this.Login.bind(this);
        // this.ui.OnQuestionAnswered.push(this.QuestionAnswered.bind(this));
        // this.resourceManager.loadResourceByPath(HTMLImageElement, "")

        // console.log("app initialised", this.spotifyInterface);
        // this.switchGraphics();
    }

    async getProfile() {
        console.log("authorized", this.spotifyInterface.Authorized);
        if (this.spotifyInterface.Authorized) {
            this.spotifyInterface.GetUserProfile();
            console.log("User profile:", this.profile);
        }
    }

    public switchGraphics(color : THREE.Color) {
        // this.graphics.switchColorForward(color, 0.5)
    }

    public resetGraphics() {
        // this.graphics.switchColorBackward();
    }

    public Login() {
        // called from UI on landing page button click
        if (this.spotifyInterface.Authorized) {
            this.spotifyInterface.GetUserProfile();
            console.log("User profile:", this.profile);
        } else {
            this.spotifyInterface.GetAuthorization();
        }
    }

    public CreatePlaylist() {
        console.log("create playlist");
        this.ui.showEndFrame(this.createPlaylistDescription());
        this.generatePlaylist();
    }

    public createPlaylistDescription() {
        // create the playlist description
        var desc = "";

        var settingMap = [
            "Best savoured on a sizzling beach day, ",
            "Best savoured against the backdrop of city lights, ",
            "Best savoured against the skyline of towering mountains, ",
            "Best savoured on your local park bench, ",
        ]

        var buddyMap = [
            "a travelling circus clown.",
            "a roaring T-Rex.",
            "a cheeky Leprechaun.",
            "at a Masquerade ball.",
            "a robot from the year 3000.",
            "an extra cool snowman."
        ]

        var setting = settingMap[data.mcqQuestions[0].options.indexOf(data.mcqQuestions[0].answer)] 
        var buddy = buddyMap[data.mcqQuestions[2].options.indexOf(data.mcqQuestions[2].answer)];

        desc = setting + "your brew is extra fresh and topped off with just a dash of liquid " + data.mcqQuestions[4].answer.replace("ingredient_x_", "") + ". "

        var seg1, seg2, seg3, seg4;

        data.sliderQuestions.forEach((q)=> {
            switch(q.params) {
                case si.QueryParameters.Danceability:
                    if (q.answer <=10) {
                        seg1 = "Kick back and chill "
                    } else if (q.answer <= 35) {
                        seg1 = "Get that toe tappin' "
                    } else if (q.answer <= 66) {
                        seg1 = "Shake that thang "
                    } else {
                        seg1 = "Raise the roof "
                    }
                    break;
                
                case si.QueryParameters.Energy:
                    if (q.answer <=10) {
                        seg2 = "with low key tunes "
                    } else if (q.answer <= 35) {
                        seg2 = "to easy listening tunes "
                    } else if (q.answer <= 66) {
                        seg2 = "to feel-good tunes "
                    } else {
                        seg2 = "with heavy-hitter bangers "
                    }
                    break;

                case si.QueryParameters.Valence:
                    if (q.answer <=10) {
                        seg3 = "filled with all the right feels."
                    } else if (q.answer <= 35) {
                        seg3 = "that’ll get you unwinding."
                    } else if (q.answer <= 66) {
                        seg3 = "that hit just right."
                    } else {
                        seg3 = "that’ll have you feeling like " + buddy;
                    }
                    break;
                
                case si.QueryParameters.Speechiness:
                    break;
                
                default:
                    break;
            }
        })

        desc = desc + seg1 + seg2 + seg3;
        return desc;

    // 0 - 0.10 
    // Dance - Kick back and chill... 
    // Duration - for a sec... 
    // Energy - with low key tunes…
    // Valance - filled with all the right feels. 

    // 0.11 - 0.33
    // Dance - Get that toe tappin’...
    // Energy -  to easy listening tunes…
    // Valance - that’ll get you unwinding…
    // Pull from rapid-fire - just like you’re in your favourite <micro pub>.

    // 0.34 - 0.66
    // Dance - Shake that thang...
    // Energy - to feel-good tunes…
    // Valance - that hit just right.
    // Pull from rapid-fire - just like you’re in your favourite <brew bar>.

    // 0.67 - 0.99
    // Dance - Raise the roof…
    // Duration - all night long... 
    // Energy - with heavy-hitter bangers…
    // Valance - that’ll have you feeling like <Godzilla>. Note: insert chosen drinking buddy

    // EXAMPLE:
    // Raise the roof all night long with heavy-hitter bangers and podcasts that’ll have you feeling like <Godzilla>.

    }

    async generatePlaylist() {
        // get spotify paramaters

        
        if (this.profile !== undefined && this.topArtists !== undefined && this.topTracks !== undefined) {
            const name = this.profile.DisplayName;
            const queries = [];

            for (var i=0; i<data.sliderQuestions.length; i++) {
                let q = data.sliderQuestions[i];

                if (q.params === si.QueryParameters.PlaylistLength) {
                    this.requestedPlaylistLength = q.answer
                    console.log("requested playlist length", this.requestedPlaylistLength)
                }

                else {
                    queries.push({parameter: si.QueryParameters[q.params], value: q.answer});
                }
            }

            // get a random selection of genres
            let genres: string[] = [];
            this.topArtists.map(x => x.Genres.forEach((genre) => genres.push(genre)));
            shuffle(genres);
            genres = genres.slice(0, 3);
            
            // get two random top tracks
            let tracks: string[] = this.topTracks.map(track => track.Id);
            shuffle(tracks);
            tracks = tracks.slice(0, 2);

            this.spotifyInterface.GetRecommendations({
                QueryParameters: queries,
                Count: 100,
                SeedGenres: genres,
                SeedTrackIDs: tracks
            });
        }
        // console.log(data.mcqQuestions);
        // console.log(data.qfQuestions);
        // console.log(data.sliderQuestions);

    }

    // public Login() {
    //     // kick it all off
    //     // called from UI
    //     console.log("spotify authorised?", this.spotifyInterface.Authorized);

    //     if (this.spotifyInterface.Authorized) {
    //         this.ui.authenticated();
    //         this.spotifyInterface.GetUserProfile();
    //         console.log(this.profile);
    //     } else {
    //         this.spotifyInterface.GetAuthorization();
    //     }
    // }

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

                
                this.spotifyInterface.GetTopArtists();
                this.spotifyInterface.GetTopTracks();
                break;

            // when we get recommendations back, we can automatically create the new playlist
            case si.DataType.Recommendations:

                var recommendations = (data as si.Track[]);
                console.log(recommendations);

                // all this below is to build a playlist just over four hours
                const playlistLengthSeconds = 60 * this.requestedPlaylistLength;
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

                // console.log(window.location.href);

                if (this.profile !== undefined) {
                    this.spotifyInterface.CreatePlaylist({
                        UserId: this.profile.id,
                        TrackUris: trackUris,
                        Name: "The Sound of Nectaron",
                        Description: "",
                        Public: false,
                        Image: {
                            Width: 72,
                            Height: 72,
                            Url: "http://thesoundofnectaron.truedigital.co.nz/assets/albumCover.jpg"
                        }
                    });
                }
     
                break;

            case si.DataType.TopTracks:
                this.topTracks = (data as si.Track[]);
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
