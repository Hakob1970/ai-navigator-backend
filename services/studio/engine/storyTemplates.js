const STORY_TEMPLATES = {

    // =========================
    // THE CHOSEN ONE
    // =========================

    chosen_one: {
        id: "chosen_one",

        name: "The Chosen One",

        description:
            "An ordinary or unexpected protagonist becomes central to a conflict larger than themselves.",

        acts: {
            act1: {
                title: "The Calling",
                summary:
                    "The protagonist discovers an unexpected responsibility and realizes that a larger conflict is approaching."
            },

            act2: {
                title: "The Burden",
                summary:
                    "A growing threat forces the protagonist to act while escalating challenges and difficult choices test their ability to accept the responsibility."
            },

            act3: {
                title: "The Choice",
                summary:
                    "The protagonist confronts the central threat, accepts or rejects the responsibility, and faces the consequences of that decision."
            }
        }
    },


    // =========================
    // THE QUEST
    // =========================

    quest: {
        id: "quest",

        name: "The Quest",

        description:
            "A protagonist pursues an important goal through a journey filled with obstacles and consequences.",

        acts: {
            act1: {
                title: "The Goal",
                summary:
                    "The protagonist receives or discovers an important goal and begins the journey toward achieving it."
            },

            act2: {
                title: "The Journey",
                summary:
                    "The protagonist faces escalating obstacles, losses, and difficult choices that make the original goal increasingly difficult to achieve."
            },

            act3: {
                title: "The Confrontation",
                summary:
                    "The protagonist reaches the decisive confrontation and achieves, changes, or loses the original goal."
            }
        }
    },


    // =========================
    // THE MYSTERY
    // =========================

    mystery: {
        id: "mystery",

        name: "The Mystery",

        description:
            "A hidden truth gradually emerges through investigation, clues, discoveries, and revelations.",

        acts: {
            act1: {
                title: "The Mystery",
                summary:
                    "A mysterious event or unanswered question appears, and the protagonist begins investigating while discovering the first clues."
            },

            act2: {
                title: "The Investigation",
                summary:
                    "The investigation becomes more dangerous as new discoveries, contradictions, and misleading evidence complicate the search for the truth."
            },

            act3: {
                title: "The Truth",
                summary:
                    "The central truth is uncovered and the protagonist must deal with the consequences of the revelation."
            }
        }
    },


    // =========================
    // RISE AND FALL
    // =========================

    rise_and_fall: {
        id: "rise_and_fall",

        name: "Rise and Fall",

        description:
            "A protagonist gains power, success, or influence before facing a crisis caused by their choices.",

        acts: {
            act1: {
                title: "The Rise",
                summary:
                    "The protagonist begins with a clear ambition and starts gaining success, power, or influence."
            },

            act2: {
                title: "The Cost of Success",
                summary:
                    "Success creates new risks, enemies, and personal weaknesses while the protagonist's choices begin to threaten what they have built."
            },

            act3: {
                title: "The Fall",
                summary:
                    "A major crisis threatens everything the protagonist built, forcing them to face the consequences and reach a new state."
            }
        }
    },


    // =========================
    // FORBIDDEN RELATIONSHIP
    // =========================

    forbidden_relationship: {
        id: "forbidden_relationship",

        name: "Forbidden Relationship",

        description:
            "A meaningful relationship develops while external or internal forces make it difficult to sustain.",

        acts: {
            act1: {
                title: "The Connection",
                summary:
                    "Two characters encounter each other and form a meaningful connection despite the circumstances surrounding them."
            },

            act2: {
                title: "The Conflict",
                summary:
                    "Their relationship deepens while external pressure and internal conflict increasingly threaten their connection."
            },

            act3: {
                title: "The Choice",
                summary:
                    "The characters face a decisive emotional choice and the relationship reaches its final outcome."
            }
        }
    },


    // =========================
    // SURVIVAL
    // =========================

    survival: {
        id: "survival",

        name: "Survival",

        description:
            "A protagonist must survive an increasingly dangerous situation while making difficult choices.",

        acts: {
            act1: {
                title: "The Trap",
                summary:
                    "The protagonist becomes trapped in a dangerous situation and discovers the scale of the threat."
            },

            act2: {
                title: "The Struggle",
                summary:
                    "Resources, trust, and available options begin to disappear as the protagonist faces increasingly difficult survival choices."
            },

            act3: {
                title: "The Final Challenge",
                summary:
                    "The protagonist faces the greatest survival challenge and survives, escapes, or faces the final consequence."
            }
        }
    }

};


module.exports = STORY_TEMPLATES;
