import { NewsItem, Vote, VerificationStatus, CATEGORIES } from '../types';
import { City } from '../data/cities';

const sampleTitles = [
    "Scientists Discover Water on Mars in Liquid Form",
    "Global Tech Summit Announces Breakthrough in AI Consciousness",
    "New Environmental Regulations Pass Unanimously in Parliament",
    "Mysterious Underwater Structure Found off the Coast of Japan",
    "Local Sports Team Wins Championship in Stunning Upset",
    "International Space Station Reports Unidentified Flying Object",
    "Breakthrough in Fusion Energy Could Power Cities by 2040",
    "Ancient Manuscript Deciphered, Revealing Lost History",
    "New Study Links Gut Health to Mental Well-being",
    "World's Largest Telescope Begins Operations in Chile",
    "Self-Driving Cars Now Outperform Human Drivers in Safety Tests",
    "Major Corporation Pledges to Be Carbon Neutral by 2030",
    "Art Heist: Famous Painting Stolen from National Museum",
    "Deep-Sea Exploration Uncovers Hundreds of New Marine Species"
];

const sampleDescriptions = [
    "After years of searching, new rover data confirms the presence of flowing, liquid water, raising hopes for finding extraterrestrial life.",
    "A leading AI firm has demonstrated what they claim to be the first truly sentient artificial intelligence, sparking ethical debates worldwide.",
    "In a landmark decision, lawmakers have approved a sweeping set of new rules aimed at curbing carbon emissions by 50% over the next decade.",
    "Sonar mapping has revealed a massive, geometric structure deep in the Pacific Ocean, with archaeologists baffled as to its origin.",
    "Against all odds, the underdog team clinched the title in the final seconds of the game, sending the city into a frenzy of celebration.",
    "Astronauts aboard the ISS have captured high-resolution images of an object maneuvering in ways that defy current physics.",
    "A consortium of researchers announced they have achieved a net energy gain in a fusion reaction, a pivotal moment for clean energy.",
    "Linguists have successfully translated a previously unreadable ancient text, offering unprecedented insights into a forgotten civilization.",
    "A decade-long study published today shows a definitive correlation between a diverse gut microbiome and reduced rates of depression and anxiety.",
    "The Atacama Large Millimeter Array (ALMA) has officially gone online, promising to revolutionize our understanding of star formation and distant galaxies.",
    "Data from millions of miles of road tests indicates that autonomous vehicles are now involved in significantly fewer accidents per mile than human-operated ones.",
    "The CEO of a global manufacturing giant announced an ambitious plan to completely offset the company's carbon footprint within the next eight years.",
    "Security footage shows a lone figure disabling the museum's advanced alarm system and making off with the priceless masterpiece.",
    "An unmanned submersible exploring the Mariana Trench has transmitted images of bizarre, never-before-seen creatures, highlighting how little we know of our oceans."
];

export const generateRandomVote = (cities: City[]): Vote => {
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    return {
        id: new Date().toISOString() + Math.random(),
        isReal: Math.random() > 0.4, // Skewed slightly towards 'Real'
        location: randomCity.name,
        timestamp: new Date().toISOString()
    };
};

export const generateRandomNewsItem = (cities: City[]): NewsItem => {
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    const randomCategory = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const id = new Date().toISOString() + Math.random();

    return {
        id,
        title: sampleTitles[Math.floor(Math.random() * sampleTitles.length)],
        description: sampleDescriptions[Math.floor(Math.random() * sampleDescriptions.length)],
        imageUrl: `https://picsum.photos/800/400?random=${id}`,
        location: randomCity.name,
        category: randomCategory,
        votes: [],
        evidence: [],
        clicks: Math.floor(Math.random() * 50),
        verification: { status: VerificationStatus.UNVERIFIED },
        userVote: null,
        userVoteId: null,
        userVoteCount: 0,
        sharedByUser: false,
        createdAt: new Date().toISOString(),
    };
};