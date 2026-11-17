import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface Section {
    paragraph: string
    image: string
}

interface ResourceInput {
    title: string
    url: string
    type: "article" | "paper" | "tool" | "repo"
    note?: string
}

interface CardConfigInput {
    type: string
    title: string
    description?: string
    image: string
    sections?: Section[]
    resources?: ResourceInput[]
}

const cardsConfig: CardConfigInput[] = [
    {
        type: "rabies",
        title: "Rabies",
        description: "The historical progression and pathology of the virus.",
        image: "/rabies.jpg",
        resources: [
            {
                title: "Rabies-Free Countries 2026",
                url: "https://worldpopulationreview.com/country-rankings/rabies-free-countries",
                type: "article",
                note: "Wide range of Rabies statistics."
            }
        ]
    },
    {
        type: "castrato",
        title: "The Castrato",
        image: "/castrato.jpg",
        description: "Explore the history of opera's legendary soprano-range male vocalists.",
        sections: [
            {
                paragraph: "The story of the Castrati is one of the most remarkable and disturbing in musical history. From the 16th to the 19th century, thousands of boys were castrated before puberty to preserve their high vocal registers.",
                image: "/castrato.jpg"
            },
            {
                paragraph: "In the Baroque era, they became the superstars of opera, commanding enormous fees and adulation. Their voices were described as otherworldly, capable of extraordinary breath control.",
                image: "/castrato.jpg"
            },
            {
                paragraph: "Rigorous daily training included hours of vocal exercises, studying ornamentation, and mastering dramatic stage presence alongside conservatory tutors.",
                image: "/castrato.jpg"
            },
            {
                paragraph: "As musical tastes shifted toward romanticism and realism, public sentiment turned against the practice, leading to official bans and the eventual end of the era.",
                image: "/castrato.jpg"
            }
        ]
    },
    {
        type: "rat",
        title: "Rat Evolution",
        image: "/rats.jpg",
        description: "An evolutionary deep dive into rodent adaptation.",
        sections: [
            {
                paragraph: "Rodents represent nearly half of all mammalian species, originating millions of years ago and outliving many larger prehistoric competitors.",
                image: "/rats.jpg"
            },
            {
                paragraph: "Their highly adaptable jaw structure and constantly growing incisors allow them to consume almost any food source available in human environments.",
                image: "/rats.jpg"
            },
            {
                paragraph: "Living alongside human settlements provided rats with endless shelter and food security, fueling their global expansion.",
                image: "/rats.jpg"
            }
        ]
    },
    {
        type: "caduceus",
        title: "The Caduceus Symbolism",
        image: "/caduceus.jpg",
        description: "Unpacking the historical confusion between Hermes staff and the Rod of Asclepius.",
        sections: [
            {
                paragraph: "The staff of Hermes features two intertwined serpents and wings, originally symbolizing heraldry, commerce, and negotiation.",
                image: "/caduceus.jpg"
            },
            {
                paragraph: "Confusion arose in the early 20th century when the U.S. Army Medical Corps mistakenly adopted the Caduceus instead of the true medical emblem.",
                image: "/caduceus.jpg"
            },
            {
                paragraph: "The authentic symbol of medicine is the Rod of Asclepius - a single snake wrapped around a rough wooden staff.",
                image: "/caduceus.jpg"
            },
            {
                paragraph: "Despite historical corrections by historians, the Caduceus remains deeply entrenched in commercial medical branding worldwide.",
                image: "/caduceus.jpg"
            }
        ]
    },
    {
        type: "gravity",
        title: "Gravity Rooms",
        image: "/gravity.jpg",
        description: "Exploring the mechanics of artificial gravity and rotational environments.",
        sections: [
            {
                paragraph: "The staff of Hermes features two intertwined serpents and wings, originally symbolizing heraldry, commerce, and negotiation.",
                image: "/caduceus.jpg"
            },
            {
                paragraph: "Confusion arose in the early 20th century when the U.S. Army Medical Corps mistakenly adopted the Caduceus instead of the true medical emblem.",
                image: "/caduceus.jpg"
            },
            {
                paragraph: "The authentic symbol of medicine is the Rod of Asclepius - a single snake wrapped around a rough wooden staff.",
                image: "/caduceus.jpg"
            },
            {
                paragraph: "Despite historical corrections by historians, the Caduceus remains deeply entrenched in commercial medical branding worldwide.",
                image: "/caduceus.jpg"
            }
        ]
    },
    {
        type: "windchimes",
        title: "Windchimes",
        image: "/windchime.png",
        description: "The acoustic resonance, harmonic structure, and kinetic physics of windchimes.",
        sections: [
            {
                paragraph: "The staff of Hermes features two intertwined serpents and wings, originally symbolizing heraldry, commerce, and negotiation.",
                image: "/caduceus.jpg"
            },
            {
                paragraph: "Confusion arose in the early 20th century when the U.S. Army Medical Corps mistakenly adopted the Caduceus instead of the true medical emblem.",
                image: "/caduceus.jpg"
            },
            {
                paragraph: "The authentic symbol of medicine is the Rod of Asclepius - a single snake wrapped around a rough wooden staff.",
                image: "/caduceus.jpg"
            },
            {
                paragraph: "Despite historical corrections by historians, the Caduceus remains deeply entrenched in commercial medical branding worldwide.",
                image: "/caduceus.jpg"
            }
        ]
    },
];

async function main() {
    await prisma.learningEntry.deleteMany()

    for (const card of cardsConfig) {
        // Collect descriptions and images from sections, fallback to top-level if sections don't exist
        const descriptions = card.sections
            ? card.sections.map(s => s.paragraph)
            : [card.description || ''];

        const images = card.sections
            ? Array.from(new Set([card.image, ...card.sections.map(s => s.image)]))
            : [card.image];

        await prisma.learningEntry.create({
            data: {
                slug: card.type,
                title: card.title,
                category: 'Archive',
                content: card.description || (card.sections?.[0]?.paragraph ?? ''),
                descriptions: descriptions,
                imageUrls: images,
                resources: card.resources ? (card.resources as any) : [],
                datePublished: new Date().toISOString().split('T')[0],
            },
        })
    }

    console.log('✅ Successfully seeded cards configuration into database!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })