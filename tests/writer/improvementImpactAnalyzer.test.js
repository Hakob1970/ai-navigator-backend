const ImpactAnalyzer =
require("../../services/studio/improvementImpactAnalyzer");

console.log(

    ImpactAnalyzer.compare(

        {
            quality: {
                overall: 40
            }
        },

        {
            quality: {
                overall: 65
            }
        }

    )

);
