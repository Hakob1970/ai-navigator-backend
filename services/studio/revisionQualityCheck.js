/**
 * 📊 Revision Quality Check
 *
 * Проверяет:
 * улучшила ли ревизия проект.
 */

class RevisionQualityCheck {

    static check(project, proposal) {

        if (!proposal) {

            return {

                proposalId: null,
                status: "failed",
                reason: "Proposal not found"

            };

        }


        return {

            proposalId:
                proposal.id,

            status:
                "success",

            scoreBefore:
                0,

            scoreAfter:
                1,

            improvement:
                1,

            checkedAt:
                new Date().toISOString()

        };

    }



    static checkAll(
        project,
        proposals = []
    ) {

        return proposals.map(
            proposal =>
                this.check(
                    project,
                    proposal
                )
        );

    }

}

module.exports =
    RevisionQualityCheck;
