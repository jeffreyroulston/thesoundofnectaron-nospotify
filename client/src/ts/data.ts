import * as si from "./spotify-interface";
import { Colors } from "three";
import * as THREE from 'three';

export const COLORS = {
    beige : "#FCF1DB",
    orange : "#FF1900",
    purple : "#88009D",
    blue : "#00C1F5",
    yellow: "#FFE700",
    white : "#FFFFFF"
}

export const COLORS_THREE : { [id: string] : THREE.Color } = {
    "#FCF1DB" : new THREE.Color(0xFCF1DB),
    "#FF1900" : new THREE.Color(0xFF2000),
    "#88009D" : new THREE.Color(0x88009D),
    "#00C1F5" : new THREE.Color(0x00C1F5),
    "#FFE700" : new THREE.Color(0xFFE700)
}

export const CONTRAST : { [id: string] : string } = {
    "#FCF1DB" : COLORS.purple,
    "#FF2000" : COLORS.purple,
    "FF1900" : COLORS.orange,
    "#00C1F5" : COLORS.yellow,
    "#FFE700" : COLORS.purple
}

export enum QuestionType {
    Slider,
    MultiChoice,
    QuickFire
}

export interface QuestionRound {
    round : number,
    color: string;
    waveColor: string;
    numberColor: string,
    btnColor: string,
    text : string;
    
}

export interface Question {
    question : string
}

export interface SliderQuestion extends Question {
    params: si.QueryParameters,
    minTextValue : string,
    maxTextValue : string,
    min: number,
    max: number,
    answer : number,
    startValue : number
}

export interface MCQuestion extends Question {
    options: string[],
    answer : string,
    id: string
}

export interface QuickFireQuestion extends Question {
    answered : boolean,
    answer : boolean
}

export const ROUNDS : QuestionRound[] = [
    {
        round: 1,
        color: COLORS.orange,
        waveColor : "orange",
        numberColor: COLORS.yellow,
        btnColor : COLORS.purple,
        text : "Light? dark? Hazies? Lagers? There's a science to it. Slide the dial to show what you're in to..." 
    },
    {
        round : 2,
        color: COLORS.purple,
        waveColor : "purple",
        numberColor: COLORS.yellow,
        btnColor : COLORS.orange,
        text: "It's time to imbue some of your personality into this thing. What makes you, you?"
    },
    {
        round: 3,
        color: COLORS.blue,
        waveColor : "blue",
        numberColor: COLORS.purple,
        btnColor : COLORS.purple,
        text: "OK, for this part switch off your brain. Don't think. Just follow your instinct."
    }
]

export const sliderQuestions : Array<SliderQuestion> = [
    {
        params: si.QueryParameters.Valence,
        question : "What brew style are you after?",
        minTextValue : "Light",
        maxTextValue : "Dark",
        startValue : 0,
        min : 0,
        max: 1,
        answer : 0,
    },
    {
        params: si.QueryParameters.Speechiness,
        question : "How bitter would you like your brew?",
        minTextValue : "0 IBU",
        maxTextValue : "100 IBU",
        startValue : 50,
        min : 0.1,
        max: 0.4,
        answer : 0,
    },
    {
        params: si.QueryParameters.Energy,
        question : "What mouthfeel would you like?",
        minTextValue : "Sharp",
        maxTextValue : "Round",
        startValue : 50,
        min : 0,
        max: 1,
        answer : 0
    },
    {
        params: si.QueryParameters.PlaylistLength,
        question : "How long would you like to boil for?",
        minTextValue : "0 min",
        maxTextValue : "120 min",
        startValue : 50,
        min : 120,
        max: 240,
        answer : 0
    },
    {
        params: si.QueryParameters.Danceability,
        question : "How strong are the beer goggles on this one??",
        minTextValue : "Weak",
        maxTextValue : "Strong",
        startValue : 0,
        min : 0.2,
        max: 0.8,
        answer : 0
    }
]

export const mcqQuestions : Array<MCQuestion> = [
    {
        question : "Where is your Nectaron brew enjoyed?",
        id: "bg",
        options : ["beach_skyline", "city_skyline", "mountains_skyline", "park_skyline"],
        answer : ""
    },
    {
        question : "Choose your brewer",
        id: "brewer",
        options: ["brewer_computer", "brewer_cool_dude", "brewer_cool_girl", "brewer_handyman", "brewer_witch", "brewer_wrestler"],
        answer : ""
    },
    {
        question : "Choose your drinking buddy",
        id: "buddy",
        options: ["drinking_buddy_clown", "drinking_buddy_dinosaur", "drinking_buddy_leprechaun", "drinking_buddy_masquerade", "drinking_buddy_robot", "drinking_buddy_snowman"],
        answer : ""
    },
    {
        question : "Perfect pairing?",
        id: "pairing",
        options: ["beer_pairing_burger", "beer_pairing_chilli", "beer_pairing_orange", "beer_pairing_pineapple", "beer_pairing_pizza", "beer_pairing_sushi"],
        answer : ""
    },
    {
        question : "Ingredient X?",
        id: "ingredientX",
        options: ["ingredient_x_diamond", "ingredient_x_dynamite", "ingredient_x_lightning", "ingredient_x_lips", "ingredient_x_poison", "ingredient_x_skull"],
        answer : ""
    }
]

export const qfQuestions : Array<QuickFireQuestion> = [
    {
        question: "Pineapple belongs on pizza?",
        answered : false,
        answer: false
    },
    {
        question: "British version of The Office is better than the American?",
        answered : false,
        answer: false
    },
    {
        question: "New Zealand invented the pavlova?",
        answered : false,
        answer: false
    },
    {
        question: "Do you remember Ben Lummis?",
        answered : false,
        answer: false
    },
    {
        question: "Rollerblading is cooler than roller skating?",
        answered : false,
        answer: false,
    },
    {
        question: "Do you talk to yourself in the mirror?",
        answered : false,
        answer: false
    },
    {
        question: "Take your shoes off in the house?",
        answered : false,
        answer: false
    },
    {
        question: "You should always finish your plate?",
        answered : false,
        answer: false
    },
    {
        question: "Never kiss on a first date?",
        answered : false,
        answer: false
    },
    {
        question: "BK is better than McDonald's?",
        answered : false,
        answer: false
    },
    {
        question: "Kevin Hart is funnier than Dave Chappelle?",
        answered : false,
        answer: false
    },
    {
        question: "An eye for an eye?",
        answered : false,
        answer: false
    },
    {
        question: "Who Wants to Be a Millionaire is better than The Chase?",
        answered : false,
        answer: false
    },
    {
        question: "Paddington 2 is better than the Paddington 1?",
        answered : false,
        answer: false
    },
    {
        question: "Freedom doesn't exist?",
        answered : false,
        answer: false
    },
    {
        question: "The Big Bang Theory is better than Modern Family?",
        answered : false,
        answer: false
    },
    {
        question: "Apple is better than Samsung?",
        answered : false,
        answer: false
    },
    {
        question: "Biggie & 2Pac are still alive?",
        answered : false,
        answer: false
    },
    {
        question: "In a marriage, everything becomes 50% off?",
        answered : false,
        answer: false
    },
    {
        question: "Last GoT episode was horseshit?",
        answered : false,
        answer: false
    },
    {
        question: "The Room is a bonafide cinematic masterpiece?",
        answered : false,
        answer: false
    },
    {
        question: "You should clap along to the Friends intro?",
        answered : false,
        answer: false
    },
    {
        question: "The Rock is greater than Stone Cold?",
        answered : false,
        answer: false
    },
    {
        question: "Street Fighter over Tekken?",
        answered : false,
        answer: false
    },
    {
        question: "Socks and sandals are only for school kids?",
        answered : false,
        answer: false
    },
    {
        question: "Pants shouldn't ride higher than your belly button?",
        answered : false,
        answer: false
    },
    {
        question: "Front door over back door?",
        answered : false,
        answer: false
    },
    {
        question: "New York Times over The Guardian?",
        answered : false,
        answer: false
    },
    {
        question: "East Coast over West Coast?",
        answered : false,
        answer: false
    },
    {
        question: "Mountains over lakes?",
        answered : false,
        answer: false
    },
    {
        question: "Aliens exist?",
        answered : false,
        answer: false
    },
    {
        question: "Mona Lisa is overrated?",
        answered : false,
        answer: false
    },
    {
        question: "Paper straws are better than plastic straws?",
        answered : false,
        answer: false
    },
    {
        question: "I'll have the usual?",
        answered : false,
        answer: false
    },
    {
        question: "Beer in a can over a bottle?",
        answered : false,
        answer: false
    },
    {
        question: "Ketchup should be left in the fridge?",
        answered : false,
        answer: false
    },
    {
        question: "Hazys over lagers?",
        answered : false,
        answer: false
    },
    {
        question: "German beer over American beer?",
        answered : false,
        answer: false
    },
    {
        question: "You wash your legs in the shower?",
        answered : false,
        answer: false
    },
    {
        question: "Brew bar over micro pub?",
        answered : false,
        answer: false
    },
]

export const preloadList : string[] = [
    "waves/wave-orange.svg",
    "waves/wave-purple.svg",
    "shared/faqDesktop.png",
    "shared/meetNectaron.svg",
    "shared/NectaronSmall.svg",
    "round1/pineapple_bunsen_burner.png",
    "round1/q3_round.png",
    "round1/q3_sharp.png",
    "round1/q5_0.png",
    "round1/q5_1.png",
    "round1/q5_2.png",
    "round1/q5_3.png",
    "round1/q5_4.png",
    "round2/can.png",
    "round2/q1/beach_skyline_can.png",
    "round2/q1/beach_skyline.png",
    "round2/q1/city_skyline_can.png",
    "round2/q1/city_skyline.png",
    "round2/q1/mountains_skyline_can.png",
    "round2/q1/mountains_skyline.png",
    "round2/q1/park_skyline_can.png",
    "round2/q1/park_skyline.png",
    "round2/q2/brewer_computer_can.png",
    "round2/q2/brewer_computer.png",
    "round2/q2/brewer_cool_dude_can.png",
    "round2/q2/brewer_cool_dude.png",
    "round2/q2/brewer_cool_girl_can.png",
    "round2/q2/brewer_cool_girl.png",
    "round2/q2/brewer_handyman_can.png",
    "round2/q2/brewer_handyman.png",
    "round2/q2/brewer_witch_can.png",
    "round2/q2/brewer_witch.png",
    "round2/q2/brewer_wrestler_can.png",
    "round2/q2/brewer_wrestler.png",
    "round2/q3/drinking_buddy_clown_can.png",
    "round2/q3/drinking_buddy_clown.png",
    "round2/q3/drinking_buddy_dinosaur_can.png",
    "round2/q3/drinking_buddy_dinosaur.png",
    "round2/q3/drinking_buddy_leprechaun_can.png",
    "round2/q3/drinking_buddy_leprechaun.png",
    "round2/q3/drinking_buddy_masquerade_can.png",
    "round2/q3/drinking_buddy_masquerade.png",
    "round2/q3/drinking_buddy_robot_can.png",
    "round2/q3/drinking_buddy_robot.png",
    "round2/q3/drinking_buddy_snowman_can.png",
    "round2/q3/drinking_buddy_snowman.png",
    "round2/q4/beer_pairing_burger_can.png",
    "round2/q4/beer_pairing_burger.png",
    "round2/q4/beer_pairing_chilli_can.png",
    "round2/q4/beer_pairing_chilli.png",
    "round2/q4/beer_pairing_orange_can.png",
    "round2/q4/beer_pairing_orange.png",
    "round2/q4/beer_pairing_pineapple_can.png",
    "round2/q4/beer_pairing_pineapple.png",
    "round2/q4/beer_pairing_pizza_can.png",
    "round2/q4/beer_pairing_pizza.png",
    "round2/q4/beer_pairing_sushi_can.png",
    "round2/q4/beer_pairing_sushi.png",
    "round2/q5/ingredient_x_diamond_can.png",
    "round2/q5/ingredient_x_diamond.png",
    "round2/q5/ingredient_x_dynamite_can.png",
    "round2/q5/ingredient_x_lightning_can.png",
    "round2/q5/ingredient_x_lightning.png",
    "round2/q5/ingredient_x_lips_can.png",
    "round2/q5/ingredient_x_lips.png",
    "round2/q5/ingredient_x_poison_can.png",
    "round2/q5/ingredient_x_poison.png",
    "round2/q5/ingredient_x_skull_can.png",
    "round2/q5/ingredient_x_skull.png",
    "album.png",
    "albumCover.jpg",
    "spritesheet.png"
]