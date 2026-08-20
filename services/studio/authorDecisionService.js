class AuthorDecisionService {

    static createDecision({

        proposal,

        authorChoice,

        authorIdea

    }) {

        return {

            proposalId:
                proposal?.id || null,

            target:
                proposal?.target || null,

            editorSuggestion:
                proposal?.change || null,

            authorChoice:
                authorChoice || "approve",

            authorIdea:
                authorIdea || null,

            createdAt:
                new Date().toISOString()

        };

    }


    static evaluateAuthorIdea(authorIdea) {

        if (!authorIdea) {

            return {

                score: 0,

                recommendation:
                    "No custom solution provided.",

                risks: []

            };

        }


        return {

            score: 75,

            recommendation:
                "Author solution appears viable but should be reviewed.",

            risks: [

                "Potential continuity conflicts",

                "May require additional scene revisions"

            ]

        };

    }

}

module.exports =
    AuthorDecisionService;
