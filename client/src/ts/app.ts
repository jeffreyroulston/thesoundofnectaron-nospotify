import * as si from "./spotify-interface";
// import * as Questions from "./questions";
import * as THREE from 'three';
import * as data from "./data";
import UI from "./ui";
import ResourceManager, { GLTFAsset } from "./resource-manager";
import Graphics from "./graphics";
import Landing from "./landing";
import Game from "./rounds";
import { easeExpIn } from "d3";
import { shuffle } from "./helpers";
import AudioPlayer from "./audio";
import Fire from "./fire";

let CLIENT_ID: string = 'c5a5170f00bf40e2a89be3510402947c';
// let REDIRECT_URI: string = "http://10.100.10.63:8888";
let REDIRECT_URI: string = "http://localhost:8888";
// let REDIRECT_URI: string = "http://192.168.1.155:8888";
// let REDIRECT_URI: string = "https://thesoundofnectaron.com";
// let REDIRECT_URI: string = "https://thesoundofnectaron.truedigital.co.nz";
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
    static resourceManager: ResourceManager = new ResourceManager();
    // private ui: UI = new UI(this.graphics);
    private ui: UI = new UI(this);
    private profile: si.UserProfile | undefined;
    private topArtists: si.Artist[] | undefined;
    private topTracks: si.Track[] | undefined;
    public playlistCreated: si.Playlist | undefined;
    private playlistDescription = "";
    private alreadyAskedForRecommendations = false;
    private requestedPlaylistLength: number = 120;

    // audio
    static audio: AudioPlayer;

    constructor() {
        // create audio thing
        App.audio = new AudioPlayer(this.ui)

        // bind UI login
        this.ui.Login = this.Login.bind(this);

        // load some extra assets for the canvas
        App.resourceManager.loadResourceByPath(HTMLImageElement, "assets/spritesheet.png");
        // App.resourceManager.loadResourceByPath(HTMLImageElement, "assets/noise-tex.png");
        
        // initialise spotify interface
        this.spotifyInterface = new si.SpotifyInterface({ClientID: CLIENT_ID, RedirectURI: REDIRECT_URI, Scopes: SCOPES});
        this.spotifyInterface.NameSet = this.ui.nameSet.bind(this.ui);
        this.spotifyInterface.OnDataListeners.push(this.OnUserData.bind(this));
        this.spotifyInterface.OnErrorListeners.push(this.OnSpotifyInterfaceError.bind(this));

        // check if authorised
        this.getProfile();
    }

    async getProfile() {
        console.log("authorized", this.spotifyInterface.Authorized);
        if (this.spotifyInterface.Authorized) {
            this.spotifyInterface.GetUserProfile();
            console.log("User profile:", this.profile);
        }
    }

    // private playlistCreated(url : string) {
    //     console.log("playlist created", url);
    //     this.ui.playlistCreated(url);
    // }

    public switchGraphics(color : THREE.Color) {
        // this.graphics.switchColorForward(color, 0.5)
    }

    public resetGraphics() {
        // this.graphics.switchColorBackward();
    }

    public get authorized(): boolean {
        return this.spotifyInterface.Authorized;
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
        this.createPlaylistDescription();
    }

    private createPlaylistDescription() {
        // create the playlist description
        var intro = "Here's your special brew, with a dash of ";

        var ingredientMap = [
            "liquid sparkle.<br /><br />",
            "something explosive.<br /><br />",
            "liquid lightning.<br /><br />",
            "liquid passion.<br /><br />",
            "liquid mortality.<br /><br />",
            "liquid alchemy.<br /><br />"
        ]

        var settingMap = [
            "at the beach, ",
            "against the city skyline, ",
            "out in the countryside, ",
            "in the park, ",
        ]

        var buddyMap = [
            "you're the star of a circus.",
            "Gojira.",
            "a cheeky Leprechaun.",
            "you're in 'that scene' in Eyes Wide Shut.",
            "you're in your prime",
            "a thug of a snowman. Respect the drip."
        ]

        var ingredient = ingredientMap[data.mcqQuestions[4].options.indexOf(data.mcqQuestions[4].answer)] 
        var setting = settingMap[data.mcqQuestions[0].options.indexOf(data.mcqQuestions[0].answer)] 
        var buddy = buddyMap[data.mcqQuestions[2].options.indexOf(data.mcqQuestions[2].answer)];
        var danceability = "", energy = "", valence = "";

        data.sliderQuestions.forEach((q)=> {
            switch(q.params) {
                case si.QueryParameters.Danceability:
                    if (q.answer <=10) {
                        danceability = "Kick back and chill "
                    } else if (q.answer <= 33) {
                        danceability = "Get that toe tappin' "
                    } else if (q.answer <= 66) {
                        danceability = "Shake that thang "
                    } else {
                        danceability = "Raise the roof "
                    }
                    break;
                
                case si.QueryParameters.Energy:
                    if (q.answer <=10) {
                        energy = "with low key tunes "
                    } else if (q.answer <= 33) {
                        energy = "to easy listening tunes "
                    } else if (q.answer <= 66) {
                        energy = "to feel-good tunes "
                    } else {
                        energy = "with heavy-hitter bangers "
                    }
                    break;

                case si.QueryParameters.Valence:
                    if (q.answer <=10) {
                        valence = "filled with all the right feels."
                    } else if (q.answer <= 33) {
                        valence = "that'll get you unwinding."
                    } else if (q.answer <= 66) {
                        valence = "that hit just right."
                    } else {
                        valence = "that'll have you feeling like " + buddy;
                    }
                    break;
                
                case si.QueryParameters.Speechiness:
                    break;
                
                default:
                    break;
            }
        })

        var longDesc = intro + ingredient + danceability + setting + energy + valence
        this.playlistDescription = danceability + energy + valence;
        this.ui.setEndFrameCopy(longDesc);
        this.generatePlaylist();
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

            if (genres.length == 0) {
                genres.push("pop", "alternative");
            }
            
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
    public OnUserData(type: si.DataType, userData: si.Data): void {

        switch (type) {
            case si.DataType.UserProfile:
            
                this.profile = (userData as si.UserProfile);
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

                var recommendations = (userData as si.Track[]);
                console.log(recommendations);



                // no recommendations
                if (recommendations.length == 0 && !this.alreadyAskedForRecommendations) {

                    this.alreadyAskedForRecommendations = true;

                    if (this.topArtists !== undefined) {

                        if (this.topArtists.length == 0) {
                            // need generic playlist here
                        }

                        else {
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

                            const seedArtists = this.topArtists.map(x => x.Id).slice(0, 5);

                            this.spotifyInterface.GetRecommendations({
                                QueryParameters: queries,
                                Count: 100,
                                SeedArtistIDs: seedArtists
                            });
                        }
                    }
                }

                // got recommendations so keep going
                else {
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
                            Description: this.playlistDescription,
                            Public: false,
                            Image: {
                                Width: 100,
                                Height: 100,
                                Url: "https://thesoundofnectaron.com/assets/albumCover.jpg"

                            }
                        });
                    }
                }
     
                break;

            case si.DataType.TopTracks:
                this.topTracks = (userData as si.Track[]);
                break;

            case si.DataType.TopArtists:
                this.topArtists = (userData as si.Artist[]);
                break;

            case si.DataType.PlaylistCreated:
                this.playlistCreated = (userData as si.Playlist);
                console.log("playlist created in app");
                this.ui.playlistCreated(this.playlistCreated.ShareLink);
                break;
        }
    }

    public OnSpotifyInterfaceError(type: si.ErrorType, data?: any) {
        console.log(type.toString());
        console.log(data);
    }
}

const app: App = new App();
