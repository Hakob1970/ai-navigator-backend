const ReAnalysisEngine =
    require("../../services/studio/reAnalysisEngine");

console.log(
    ReAnalysisEngine.compare(20, 60)
);

console.log(
    ReAnalysisEngine.compare(20, 20)
);

console.log(
    ReAnalysisEngine.compare(60, 20)
);
