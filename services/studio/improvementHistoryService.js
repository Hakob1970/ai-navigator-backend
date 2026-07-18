/**
 * 📚 Improvement History Service
 *
 * Хранит историю редакторских изменений.
 *
 * Не изменяет проект.
 * Только записывает события.
 */


class ImprovementHistoryService {



    static createRecord(
        proposal,
        action,
        note = null
    ) {


        if (!proposal) {
            return null;
        }


        return {

            id:
                "history_" +
                Date.now() +
                "_" +
                Math.floor(
                    Math.random() * 1000
                ),


            proposalId:
                proposal.id || null,


            action,


            type:
                proposal.type || null,


            target:
                proposal.target || null,


            character:
                proposal.character || null,


            scene:
                proposal.scene || null,


            note,


            createdAt:
                new Date().toISOString()

        };

    }





    static add(
        project,
        record
    ) {


        if (!project || !record) {
            return project;
        }


        if (
            !project.improvementHistory
        ) {

            project.improvementHistory = [];

        }


        project.improvementHistory.push(
            record
        );


        return project;

    }





    static getHistory(
        project
    ) {


        if (
            !project ||
            !project.improvementHistory
        ) {

            return [];

        }


        return project.improvementHistory;

    }





    static getByType(
        project,
        type
    ) {


        return this
            .getHistory(project)
            .filter(
                item =>
                    item.type === type
            );

    }



}


module.exports =
    ImprovementHistoryService;
