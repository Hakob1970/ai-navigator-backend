/**
 * ✅ Improvement Approval System
 *
 * Управляет жизненным циклом предложений:
 *
 * waiting_approval
 * approved
 * rejected
 */

class ImprovementApproval {

    static approve(proposal) {

        if (!proposal) {
            return null;
        }

        return {
            ...proposal,
            status: "approved"
        };

    }

    static reject(proposal) {

        if (!proposal) {
            return null;
        }

        return {
            ...proposal,
            status: "rejected"
        };

    }

    static approveAll(proposals = []) {

        return proposals.map(
            proposal => this.approve(proposal)
        );

    }

    static rejectAll(proposals = []) {

        return proposals.map(
            proposal => this.reject(proposal)
        );

    }

}

module.exports = ImprovementApproval;
