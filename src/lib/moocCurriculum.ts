export type MoocUnitType = "video" | "reading" | "ref_video" | "quiz" | "assignment" | "lab" | "live";

export type MoocUnit = {
  id: string;
  title: string;
  type: MoocUnitType;
  durationMinutes: number;
  durationLabel: string;
  summary: string;
  contentSnippet?: string;
  resourceLink?: string;
  fileName?: string;
  isMandatory?: boolean;
};

export type MoocTopic = {
  id: string;
  title: string;
  summary: string;
  units: MoocUnit[];
};

export type MoocModule = {
  id: number;
  number: string;
  title: string;
  summary: string;
  topics: MoocTopic[];
};

export type QaChecklistItem = {
  id: string;
  criterion: string;
  description: string;
  required: string;
  found: string;
  status: "pass" | "warn" | "fail";
};

export type CourseQaAudit = {
  score: number;
  status: "Eligible & Verified" | "Eligible with Recommendations" | "Needs Revision";
  totalDurationMinutes: number;
  totalHours: number;
  moduleCount: number;
  topicCount: number;
  unitCount: number;
  videoCount: number;
  readingCount: number;
  quizCount: number;
  assignmentCount: number;
  hasCapstone: boolean;
  checklist: QaChecklistItem[];
};

export const STATISTICS_MOOC_CURRICULUM: MoocModule[] = [
  {
    id: 1,
    number: "01",
    title: "Introduction to Statistics and Research Design",
    summary: "Establish the statistical foundation, understand qualitative vs. quantitative variables, and master observational vs. experimental research frameworks.",
    topics: [
      {
        id: "1-1",
        title: "Role of Statistics in Research",
        summary: "Contextualize data-driven decision making, variability in physical experiments, and engineering research pipelines.",
        units: [
          {
            id: "1-1-v1",
            title: "Role of Statistics in Scientific Research",
            type: "video",
            durationMinutes: 7,
            durationLabel: "7 min",
            summary: "Fundamental role of empirical data collection, reducing uncertainty, and validating scientific hypotheses.",
          },
          {
            id: "1-1-v2",
            title: "Importance of Statistics in Engineering & Research",
            type: "video",
            durationMinutes: 10,
            durationLabel: "10 min",
            summary: "How engineering tolerances, material property variability, and infrastructure safety rely on probabilistic estimation.",
          },
          {
            id: "1-1-r1",
            title: "Applications of Statistics – Notes",
            type: "reading",
            durationMinutes: 10,
            durationLabel: "10 min",
            summary: "Structured lecture handbook summarizing statistical terminology, parameter estimation, and research workflows.",
            fileName: "TM_Statistics_Module1_Notes.pdf",
          },
          {
            id: "1-1-r2",
            title: "Case Examples from Science & Engineering",
            type: "reading",
            durationMinutes: 15,
            durationLabel: "15 min",
            summary: "Concrete case reviews: geotechnical soil strength testing, hydrology streamflow records, and concrete compressive testing.",
            fileName: "Case_Studies_Engineering_Statistics.pdf",
          },
          {
            id: "1-1-rv",
            title: "Reference Video: Statistics in Real-world Research",
            type: "ref_video",
            durationMinutes: 8,
            durationLabel: "8 min",
            summary: "Industry documentary highlighting scientific data pipelines and statistical quality control in mission-critical projects.",
          },
          {
            id: "1-1-q",
            title: "Quiz: MCQs on Role of Statistics",
            type: "quiz",
            durationMinutes: 10,
            durationLabel: "10 min",
            summary: "10 concept check questions assessing your grasp of statistical estimation, inductive inference, and empirical research.",
            isMandatory: true,
          },
          {
            id: "1-1-a",
            title: "Assignment: Identify statistical applications in your discipline",
            type: "assignment",
            durationMinutes: 15,
            durationLabel: "15 min",
            summary: "Select a published engineering or scientific paper in your specialty and document how statistical tools were utilized to validate the conclusion.",
            isMandatory: true,
          },
        ],
      },
      {
        id: "1-2",
        title: "Types of Data & Measurement Scales",
        summary: "Differentiate between nominal, ordinal, interval, and ratio scales to select appropriate statistical tests.",
        units: [
          {
            id: "1-2-v1",
            title: "Qualitative vs Quantitative Data",
            type: "video",
            durationMinutes: 7,
            durationLabel: "7 min",
            summary: "Categorical, discrete, and continuous variable definitions with physical engineering interpretations.",
          },
          {
            id: "1-2-v2",
            title: "Scales of Measurement",
            type: "video",
            durationMinutes: 10,
            durationLabel: "10 min",
            summary: "Stevens' taxonomy of measurement scales: Nominal, Ordinal, Interval, and Ratio.",
          },
          {
            id: "1-2-r1",
            title: "Data Types Summary Sheet",
            type: "reading",
            durationMinutes: 10,
            durationLabel: "10 min",
            summary: "Quick-reference cheat sheet for classifying engineering sensor readings, survey indicators, and laboratory samples.",
            fileName: "Measurement_Scales_CheatSheet.pdf",
          },
          {
            id: "1-2-r2",
            title: "Measurement Scales with Examples",
            type: "reading",
            durationMinutes: 15,
            durationLabel: "15 min",
            summary: "Comprehensive comparative table detailing permissible mathematical operations for each scale.",
          },
          {
            id: "1-2-rv",
            title: "Reference Video: Real-life Data Classification",
            type: "ref_video",
            durationMinutes: 8,
            durationLabel: "8 min",
            summary: "Field data audit walkthrough classifying environmental sensors, GIS attributes, and material grades.",
          },
          {
            id: "1-2-q",
            title: "Quiz: Data Types & Scales",
            type: "quiz",
            durationMinutes: 10,
            durationLabel: "10 min",
            summary: "Test your skill in determining the measurement scale of 15 sample variables from laboratory and survey reports.",
            isMandatory: true,
          },
          {
            id: "1-2-a",
            title: "Assignment: Classify variables from sample data",
            type: "assignment",
            durationMinutes: 15,
            durationLabel: "15 min",
            summary: "Download the sample engineering dataset CSV and submit an audit sheet classifying all 20 columns into their scale and type.",
            isMandatory: true,
          },
        ],
      },
      {
        id: "1-3",
        title: "Population, Sample & Research Design",
        summary: "Bridge finite sample observations to population inferences, and control for confounding variables.",
        units: [
          {
            id: "1-3-v1",
            title: "Population vs Sample",
            type: "video",
            durationMinutes: 7,
            durationLabel: "7 min",
            summary: "Target population definitions, sampling frames, and sampling error fundamentals.",
          },
          {
            id: "1-3-v2",
            title: "Experimental vs Observational Studies",
            type: "video",
            durationMinutes: 10,
            durationLabel: "10 min",
            summary: "Controlled laboratory trials, field experiments, natural observational studies, and causal inference.",
          },
          {
            id: "1-3-r1",
            title: "Parameters vs Statistics",
            type: "reading",
            durationMinutes: 10,
            durationLabel: "10 min",
            summary: "Greek notation vs Roman notation: μ vs x̄, σ vs s, and unbiased sample estimators.",
          },
          {
            id: "1-3-r2",
            title: "Validity & Reliability Concepts",
            type: "reading",
            durationMinutes: 15,
            durationLabel: "15 min",
            summary: "Internal validity, external ecological validity, test-retest reliability, and instrumentation calibration.",
          },
          {
            id: "1-3-rv",
            title: "Reference Video: Research Design Explained",
            type: "ref_video",
            durationMinutes: 8,
            durationLabel: "8 min",
            summary: "Case walkthrough of experimental design protocols for peer-reviewed journal publishing.",
          },
          {
            id: "1-3-q",
            title: "Quiz: Research Design Concepts",
            type: "quiz",
            durationMinutes: 10,
            durationLabel: "10 min",
            summary: "Assess experimental setup, confounding variable controls, and random assignment protocols.",
            isMandatory: true,
          },
          {
            id: "1-3-a",
            title: "Assignment: Analyse design of a published study",
            type: "assignment",
            durationMinutes: 15,
            durationLabel: "15 min",
            summary: "Evaluate the experimental structure, sampling strategy, and internal validity of a published scientific journal article.",
            isMandatory: true,
          },
        ],
      },
    ],
  },
  {
    id: 2,
    number: "02",
    title: "Sampling Techniques, Bias & Power Analysis",
    summary: "Formulate probability vs. non-probability sampling plans, identify sources of systematic bias, and compute statistical power with G*Power.",
    topics: [
      {
        id: "2-1",
        title: "Sampling Methods",
        summary: "Simple random, stratified, cluster, and systematic sampling methodologies.",
        units: [
          {
            id: "2-1-v1",
            title: "Probability vs Non-probability Sampling",
            type: "video",
            durationMinutes: 7,
            durationLabel: "7 min",
            summary: "Theoretical foundations of equal probability of selection vs purposive/convenience approaches.",
          },
          {
            id: "2-1-v2",
            title: "Random & Stratified Sampling",
            type: "video",
            durationMinutes: 10,
            durationLabel: "10 min",
            summary: "Proportional vs disproportional stratification, variance reduction across heterogeneous geological/engineering strata.",
          },
          {
            id: "2-1-r1",
            title: "Sampling Techniques – Notes",
            type: "reading",
            durationMinutes: 10,
            durationLabel: "10 min",
            summary: "Formulas and protocols for calculating sampling weights, design effects, and cluster correlations.",
            fileName: "Sampling_Methods_Guide.pdf",
          },
          {
            id: "2-1-r2",
            title: "Sampling Case Examples",
            type: "reading",
            durationMinutes: 15,
            durationLabel: "15 min",
            summary: "Detailed case studies in environmental water quality monitoring and concrete batch inspection.",
          },
          {
            id: "2-1-rv",
            title: "Reference Video: Sampling in Surveys",
            type: "ref_video",
            durationMinutes: 8,
            durationLabel: "8 min",
            summary: "Field execution of stratified sampling across diverse geographic and infrastructural regions.",
          },
          {
            id: "2-1-q",
            title: "Quiz: Sampling Techniques",
            type: "quiz",
            durationMinutes: 10,
            durationLabel: "10 min",
            summary: "Assess your ability to select the most efficient sampling method given budget and accuracy constraints.",
            isMandatory: true,
          },
          {
            id: "2-1-a",
            title: "Assignment: Design a sampling strategy",
            type: "assignment",
            durationMinutes: 15,
            durationLabel: "15 min",
            summary: "Formulate an optimal sampling protocol for a 50 km river basin study or a 1,000-unit structural asset inspection.",
            isMandatory: true,
          },
        ],
      },
      {
        id: "2-2",
        title: "Bias & Sample Size",
        summary: "Quantify selection bias, attrition, measurement errors, and determine statistical sample size required for high power.",
        units: [
          {
            id: "2-2-v1",
            title: "Sources of Bias",
            type: "video",
            durationMinutes: 7,
            durationLabel: "7 min",
            summary: "Sampling bias, non-response bias, survivorship bias, and observer expectancy in technical experiments.",
          },
          {
            id: "2-2-v2",
            title: "Introduction to Sample Size & Power",
            type: "video",
            durationMinutes: 10,
            durationLabel: "10 min",
            summary: "Effect size (Cohen's d), significance level (α), power (1 - β), and sample size determination.",
          },
          {
            id: "2-2-r1",
            title: "Bias Reduction Methods",
            type: "reading",
            durationMinutes: 10,
            durationLabel: "10 min",
            summary: "Blinding, randomized allocation, pre-stratification, and statistical post-weighting techniques.",
          },
          {
            id: "2-2-r2",
            title: "Sample Size Concepts",
            type: "reading",
            durationMinutes: 15,
            durationLabel: "15 min",
            summary: "Mathematical derivations of sample size formulas for means and proportions.",
          },
          {
            id: "2-2-rv",
            title: "Reference Video: G*Power Overview",
            type: "ref_video",
            durationMinutes: 8,
            durationLabel: "8 min",
            summary: "Live tutorial on using G*Power software to calculate required sample sizes for t-tests, ANOVA, and regression.",
          },
          {
            id: "2-2-q",
            title: "Quiz: Bias & Power",
            type: "quiz",
            durationMinutes: 10,
            durationLabel: "10 min",
            summary: "Test knowledge on Type II errors, statistical power curves, and bias mitigation strategies.",
            isMandatory: true,
          },
          {
            id: "2-2-a",
            title: "Assignment: Critique a survey design",
            type: "assignment",
            durationMinutes: 15,
            durationLabel: "15 min",
            summary: "Review a provided experimental methodology, detect 3 fatal sampling biases, and calculate the corrected sample size.",
            isMandatory: true,
          },
        ],
      },
    ],
  },
  {
    id: 3,
    number: "03",
    title: "Descriptive Statistics & Data Visualization",
    summary: "Compute robust measures of central tendency and dispersion, and engineer high-impact scientific charts in Excel, Python, and R.",
    topics: [
      {
        id: "3-1",
        title: "Descriptive Measures",
        summary: "Mean, median, mode, variance, standard deviation, interquartile range (IQR), skewness, and kurtosis.",
        units: [
          {
            id: "3-1-v1",
            title: "Measures of Central Tendency",
            type: "video",
            durationMinutes: 7,
            durationLabel: "7 min",
            summary: "Arithmetic mean, trimmed mean, median for skewed distributions, and mode for multimodal sensor signals.",
          },
          {
            id: "3-1-v2",
            title: "Measures of Dispersion",
            type: "video",
            durationMinutes: 10,
            durationLabel: "10 min",
            summary: "Standard deviation, variance, coefficient of variation (CV) for unitless variability, and IQR for outlier resilience.",
          },
          {
            id: "3-1-r1",
            title: "Mean, Median, Mode",
            type: "reading",
            durationMinutes: 10,
            durationLabel: "10 min",
            summary: "Formulas and properties of central tendency measures with mathematical proofs of least absolute deviation.",
          },
          {
            id: "3-1-r2",
            title: "Variability Measures",
            type: "reading",
            durationMinutes: 15,
            durationLabel: "15 min",
            summary: "Sample variance (Bessel's correction n-1), degrees of freedom, and Chebyshev's inequality.",
          },
          {
            id: "3-1-rv",
            title: "Reference Video: Descriptive Statistics in Practice",
            type: "ref_video",
            durationMinutes: 8,
            durationLabel: "8 min",
            summary: "Real-world engineering data audit demonstrating descriptive analysis on a 10,000-point structural vibration dataset.",
          },
          {
            id: "3-1-q",
            title: "Quiz: Descriptive Statistics",
            type: "quiz",
            durationMinutes: 10,
            durationLabel: "10 min",
            summary: "Numerical calculations of mean, standard deviation, and IQR from sample experimental datasets.",
            isMandatory: true,
          },
          {
            id: "3-1-a",
            title: "Assignment: Compute descriptive measures",
            type: "assignment",
            durationMinutes: 15,
            durationLabel: "15 min",
            summary: "Calculate central tendency, dispersion, skewness, and kurtosis on the provided materials testing CSV using Excel or Python.",
            isMandatory: true,
          },
        ],
      },
      {
        id: "3-2",
        title: "Data Visualization",
        summary: "Select appropriate charts (box plots, histograms, Q-Q plots, scatter plots) and avoid misleading chart axes.",
        units: [
          {
            id: "3-2-v1",
            title: "Choosing Appropriate Graphs",
            type: "video",
            durationMinutes: 7,
            durationLabel: "7 min",
            summary: "Matching data type and relationship with visualization: distributions, correlations, time series, and proportions.",
          },
          {
            id: "3-2-v2",
            title: "Visualization in Excel/ R",
            type: "video",
            durationMinutes: 10,
            durationLabel: "10 min",
            summary: "Step-by-step plotting of boxplots, density histograms, and regression scatter charts with ggplot2 and Excel.",
          },
          {
            id: "3-2-r1",
            title: "Chart Selection Guide",
            type: "reading",
            durationMinutes: 10,
            durationLabel: "10 min",
            summary: "Visual decision matrix guiding researchers from research question to publication-ready figure style.",
          },
          {
            id: "3-2-r2",
            title: "Visualization Best Practices",
            type: "reading",
            durationMinutes: 15,
            durationLabel: "15 min",
            summary: "Tufte's data-to-ink ratio, color accessibility for scientific figures, error bars (SE vs SD vs 95% CI).",
          },
          {
            id: "3-2-rv",
            title: "Reference Video: Data Visualization Examples",
            type: "ref_video",
            durationMinutes: 8,
            durationLabel: "8 min",
            summary: "Critique of scientific figures from top journal publications: before vs after redesign.",
          },
          {
            id: "3-2-q",
            title: "Quiz: Graph Interpretation",
            type: "quiz",
            durationMinutes: 10,
            durationLabel: "10 min",
            summary: "Interpret multimodal distributions, identify outliers from boxplots, and detect misleading axes.",
            isMandatory: true,
          },
          {
            id: "3-2-a",
            title: "Assignment: Create charts from dataset",
            type: "assignment",
            durationMinutes: 15,
            durationLabel: "15 min",
            summary: "Construct 3 publication-ready figures (histogram with KDE, grouped boxplot with jitter, and scatter with regression line).",
            isMandatory: true,
          },
        ],
      },
    ],
  },
  {
    id: 4,
    number: "04",
    title: "Probability & Statistical Distributions",
    summary: "Master probability axioms, random variables, normal distributions, Z-scores, and the Central Limit Theorem (CLT).",
    topics: [
      {
        id: "4-1",
        title: "Probability Concepts",
        summary: "Sample spaces, conditional probability, Bayes' theorem, and discrete vs. continuous probability density functions.",
        units: [
          {
            id: "4-1-v1",
            title: "Basics of Probability",
            type: "video",
            durationMinutes: 7,
            durationLabel: "7 min",
            summary: "Addition rule, multiplication rule, independent vs mutually exclusive events.",
          },
          {
            id: "4-1-v2",
            title: "Random Variables",
            type: "video",
            durationMinutes: 10,
            durationLabel: "10 min",
            summary: "Expected values, variance of random variables, and cumulative distribution functions (CDF).",
          },
          {
            id: "4-1-r1",
            title: "Probability Rules",
            type: "reading",
            durationMinutes: 10,
            durationLabel: "10 min",
            summary: "Summary formulas for conditional probability, total probability theorem, and Bayes' rule.",
          },
          {
            id: "4-1-r2",
            title: "Worked Examples",
            type: "reading",
            durationMinutes: 15,
            durationLabel: "15 min",
            summary: "Engineering problem sets: bridge failure probability under extreme load, sensor false alarm rates.",
          },
          {
            id: "4-1-rv",
            title: "Reference Video: Probability in Daily Life",
            type: "ref_video",
            durationMinutes: 8,
            durationLabel: "8 min",
            summary: "Real-world risk modeling and failure rate calculations in safety-critical systems.",
          },
          {
            id: "4-1-q",
            title: "Quiz: Probability Concepts",
            type: "quiz",
            durationMinutes: 10,
            durationLabel: "10 min",
            summary: "Problem-solving quiz applying Bayes' theorem and conditional probability to research scenarios.",
            isMandatory: true,
          },
          {
            id: "4-1-a",
            title: "Assignment: Solve probability problems",
            type: "assignment",
            durationMinutes: 15,
            durationLabel: "15 min",
            summary: "Complete step-by-step solutions for 5 applied engineering probability questions with full derivations.",
            isMandatory: true,
          },
        ],
      },
      {
        id: "4-2",
        title: "Distributions & CLT",
        summary: "Normal, Binomial, Poisson, t, F, Chi-square distributions, Z-score standardization, and sampling distribution convergence.",
        units: [
          {
            id: "4-2-v1",
            title: "Normal Distribution & Z-scores",
            type: "video",
            durationMinutes: 7,
            durationLabel: "7 min",
            summary: "Gaussian curve properties, 68-95-99.7 empirical rule, standard normal transformation Z = (X - μ)/σ.",
          },
          {
            id: "4-2-v2",
            title: "Central Limit Theorem",
            type: "video",
            durationMinutes: 10,
            durationLabel: "10 min",
            summary: "Why sample means approach normality regardless of underlying population distribution as n increases.",
          },
          {
            id: "4-2-r1",
            title: "Distribution Types",
            type: "reading",
            durationMinutes: 10,
            durationLabel: "10 min",
            summary: "Detailed overview of standard scientific distributions with equations, parameters, and common domains.",
          },
          {
            id: "4-2-r2",
            title: "CLT Explanation",
            type: "reading",
            durationMinutes: 15,
            durationLabel: "15 min",
            summary: "Formal mathematical formulation of the Central Limit Theorem and standard error of the mean (SE = σ/√n).",
          },
          {
            id: "4-2-rv",
            title: "Reference Video: CLT Simulation",
            type: "ref_video",
            durationMinutes: 8,
            durationLabel: "8 min",
            summary: "Interactive Monte Carlo simulation demonstrating CLT convergence from uniform, exponential, and bimodal populations.",
          },
          {
            id: "4-2-q",
            title: "Quiz: Distributions & CLT",
            type: "quiz",
            durationMinutes: 10,
            durationLabel: "10 min",
            summary: "Calculate normal probabilities, percentiles, and sample mean standard errors using Z-tables.",
            isMandatory: true,
          },
          {
            id: "4-2-a",
            title: "Assignment: CLT simulation exercise",
            type: "assignment",
            durationMinutes: 15,
            durationLabel: "15 min",
            summary: "Run a 1,000-iteration sampling experiment in Excel or Python, plot sample mean histograms, and verify the CLT empirically.",
            isMandatory: true,
          },
        ],
      },
    ],
  },
  {
    id: 5,
    number: "05",
    title: "Hypothesis Testing Fundamentals",
    summary: "Formulate null and alternative hypotheses, understand critical regions, compute p-values, and balance Type I (α) and Type II (β) errors.",
    topics: [
      {
        id: "5-1",
        title: "Hypothesis & Significance",
        summary: "The formal 5-step hypothesis testing framework, directional vs non-directional tests, and interpretation of p-values.",
        units: [
          {
            id: "5-1-v1",
            title: "Null & Alternative Hypotheses",
            type: "video",
            durationMinutes: 7,
            durationLabel: "7 min",
            summary: "Constructing H0 and H1, burden of proof, one-tailed vs two-tailed test formulations.",
          },
          {
            id: "5-1-v2",
            title: "p-values & Significance",
            type: "video",
            durationMinutes: 10,
            durationLabel: "10 min",
            summary: "What a p-value is (and what it is NOT), α threshold, statistical significance vs practical/engineering significance.",
          },
          {
            id: "5-1-r1",
            title: "Hypothesis Testing Steps",
            type: "reading",
            durationMinutes: 10,
            durationLabel: "10 min",
            summary: "The canonical 5-step procedure: State hypotheses, set α, select test statistic, compute p-value, render decision.",
            fileName: "Hypothesis_Testing_Protocol.pdf",
          },
          {
            id: "5-1-r2",
            title: "Type I & II Errors",
            type: "reading",
            durationMinutes: 15,
            durationLabel: "15 min",
            summary: "False positives (α) vs false negatives (β), statistical power trade-offs, and engineering risk consequences.",
          },
          {
            id: "5-1-rv",
            title: "Reference Video: Hypothesis Testing Examples",
            type: "ref_video",
            durationMinutes: 8,
            durationLabel: "8 min",
            summary: "Walkthrough of hypothesis testing in concrete strength testing and flood mitigation effectiveness trials.",
          },
          {
            id: "5-1-q",
            title: "Quiz: Hypothesis Testing",
            type: "quiz",
            durationMinutes: 10,
            durationLabel: "10 min",
            summary: "Assess your ability to set up hypotheses, calculate test statistics, and make proper statistical decisions.",
            isMandatory: true,
          },
          {
            id: "5-1-a",
            title: "Assignment: Interpret test results",
            type: "assignment",
            durationMinutes: 15,
            durationLabel: "15 min",
            summary: "Analyze statistical output from 3 real experimental trials and write a formal research conclusion paragraph.",
            isMandatory: true,
          },
        ],
      },
    ],
  },
  {
    id: 6,
    number: "06",
    title: "Statistical Tests in Practice",
    summary: "Select, verify assumptions for, and execute one-sample, independent, paired t-tests, One-Way/Two-Way ANOVA, Mann-Whitney U, and Wilcoxon tests.",
    topics: [
      {
        id: "6-1",
        title: "Parametric & Non-parametric Tests",
        summary: "Navigating between parametric procedures and distribution-free rank tests when normality or homoscedasticity is violated.",
        units: [
          {
            id: "6-1-v1",
            title: "t-tests & ANOVA",
            type: "video",
            durationMinutes: 7,
            durationLabel: "7 min",
            summary: "Student's t-test formulations, Welch's t-test for unequal variance, and F-ratio partitioning in ANOVA.",
          },
          {
            id: "6-1-v2",
            title: "Non-parametric Tests",
            type: "video",
            durationMinutes: 10,
            durationLabel: "10 min",
            summary: "Mann-Whitney U, Wilcoxon signed-rank, Kruskal-Wallis, and Chi-square goodness-of-fit / independence tests.",
          },
          {
            id: "6-1-r1",
            title: "Test Selection Guide",
            type: "reading",
            durationMinutes: 10,
            durationLabel: "10 min",
            summary: "Comprehensive statistical flowchart mapping research questions, sample sizes, and distribution shapes to specific tests.",
            fileName: "Statistical_Test_Selection_Chart.pdf",
          },
          {
            id: "6-1-r2",
            title: "Assumptions of Tests",
            type: "reading",
            durationMinutes: 15,
            durationLabel: "15 min",
            summary: "Testing for normality (Shapiro-Wilk, Q-Q plots) and equality of variances (Levene's test, Bartlett's test).",
          },
          {
            id: "6-1-rv",
            title: "Reference Video: Statistical Tests Demo",
            type: "ref_video",
            durationMinutes: 8,
            durationLabel: "8 min",
            summary: "Live software demonstration running independent t-tests, paired comparisons, and ANOVA in R and Excel.",
          },
          {
            id: "6-1-q",
            title: "Quiz: Statistical Tests",
            type: "quiz",
            durationMinutes: 10,
            durationLabel: "10 min",
            summary: "Match experimental scenarios to the correct statistical test and interpret ANOVA summary tables.",
            isMandatory: true,
          },
          {
            id: "6-1-a",
            title: "Assignment: Choose appropriate test",
            type: "assignment",
            durationMinutes: 15,
            durationLabel: "15 min",
            summary: "Examine 4 research datasets, conduct normality and variance tests, select the optimal test, and submit full outputs.",
            isMandatory: true,
          },
        ],
      },
    ],
  },
  {
    id: 7,
    number: "07",
    title: "Regression Analysis & Modeling",
    summary: "Fit simple linear regression models, multiple regression equations, evaluate R-squared, check Gauss-Markov assumptions, and handle collinearity.",
    topics: [
      {
        id: "7-1",
        title: "Regression Analysis",
        summary: "Ordinary Least Squares (OLS) estimation, residual diagnostics, heteroscedasticity, and multiple predictor models.",
        units: [
          {
            id: "7-1-v1",
            title: "Simple Linear Regression",
            type: "video",
            durationMinutes: 7,
            durationLabel: "7 min",
            summary: "Derivation of slope (β1) and intercept (β0), Pearson's r vs coefficient of determination (R²).",
          },
          {
            id: "7-1-v2",
            title: "Multiple Regression",
            type: "video",
            durationMinutes: 10,
            durationLabel: "10 min",
            summary: "Multi-variable prediction, adjusted R², partial slopes, and variance inflation factor (VIF) for multicollinearity.",
          },
          {
            id: "7-1-r1",
            title: "Regression Assumptions",
            type: "reading",
            durationMinutes: 10,
            durationLabel: "10 min",
            summary: "The 4 Gauss-Markov pillars: Linearity, Independence, Homoscedasticity, and Normality of residuals.",
          },
          {
            id: "7-1-r2",
            title: "Interpreting Regression Output",
            type: "reading",
            durationMinutes: 15,
            durationLabel: "15 min",
            summary: "Deconstructing statistical software tables: standard errors, t-statistics, p-values, F-test, and 95% confidence intervals.",
          },
          {
            id: "7-1-rv",
            title: "Reference Video: Regression Case Study",
            type: "ref_video",
            durationMinutes: 8,
            durationLabel: "8 min",
            summary: "Real-world engineering case study predicting concrete compressive strength from cement, water-binder ratio, and age.",
          },
          {
            id: "7-1-q",
            title: "Quiz: Regression Concepts",
            type: "quiz",
            durationMinutes: 10,
            durationLabel: "10 min",
            summary: "Interpret regression equations, predict dependent values, and identify violations in residual plots.",
            isMandatory: true,
          },
          {
            id: "7-1-a",
            title: "Assignment: Regression analysis using dataset",
            type: "assignment",
            durationMinutes: 15,
            durationLabel: "15 min",
            summary: "Build an OLS multiple regression model on the provided research dataset, produce residual diagnostic plots, and report findings.",
            isMandatory: true,
          },
        ],
      },
    ],
  },
  {
    id: 8,
    number: "08",
    title: "Integration, Mini-Project & Review",
    summary: "Synthesize all course concepts into an end-to-end scientific research mini-project, submit a technical report, and complete the comprehensive review.",
    topics: [
      {
        id: "8-1",
        title: "Integrated Application",
        summary: "Capstoning the MOOC: Data cleaning, exploratory analysis, hypothesis formulation, testing, regression modeling, and reporting.",
        units: [
          {
            id: "8-1-v1",
            title: "Course Recap",
            type: "video",
            durationMinutes: 7,
            durationLabel: "7 min",
            summary: "Synthesis of the 8-module statistical journey from research design to empirical validation.",
          },
          {
            id: "8-1-v2",
            title: "Mini-project Guidelines",
            type: "video",
            durationMinutes: 10,
            durationLabel: "10 min",
            summary: "Detailed review of the capstone project structure, data submission standards, and evaluation rubric.",
          },
          {
            id: "8-1-r1",
            title: "Report Writing Guide",
            type: "reading",
            durationMinutes: 10,
            durationLabel: "10 min",
            summary: "How to report statistical results adhering to APA, IEEE, and ASCE standards for academic and industrial publications.",
            fileName: "Statistical_Reporting_Standards.pdf",
          },
          {
            id: "8-1-r2",
            title: "Sample Mini-project Report",
            type: "reading",
            durationMinutes: 15,
            durationLabel: "15 min",
            summary: "A benchmark exemplar report showing high-scoring presentation of figures, tables, and statistical conclusions.",
            fileName: "Sample_Statistical_MiniProject.pdf",
          },
          {
            id: "8-1-rv",
            title: "Reference Video: End-to-end Statistical Analysis",
            type: "ref_video",
            durationMinutes: 8,
            durationLabel: "8 min",
            summary: "Complete 15-minute live walkthrough executing an entire research study analysis from raw CSV to journal figure.",
          },
          {
            id: "8-1-q",
            title: "Quiz: Comprehensive Review Quiz",
            type: "quiz",
            durationMinutes: 10,
            durationLabel: "10 min",
            summary: "25-question summative assessment covering all 8 modules of the course.",
            isMandatory: true,
          },
          {
            id: "8-1-a",
            title: "Assignment: Final Mini-project Submission",
            type: "assignment",
            durationMinutes: 30,
            durationLabel: "30 min",
            summary: "Submit your comprehensive research mini-project report (PDF) and calculation sheet/code file. Required for verified certificate issuance.",
            isMandatory: true,
          },
        ],
      },
    ],
  },
];

export function auditCourseEligibility(modules: MoocModule[]): CourseQaAudit {
  let totalDurationMinutes = 2; // promo video
  let videoCount = 1;
  let readingCount = 0;
  let quizCount = 0;
  let assignmentCount = 0;
  let unitCount = 1;
  let topicCount = 0;

  modules.forEach((mod) => {
    (mod.topics || []).forEach((topic) => {
      topicCount++;
      (topic.units || []).forEach((unit) => {
        unitCount++;
        totalDurationMinutes += unit.durationMinutes || 0;
        if (unit.type === "video" || unit.type === "ref_video") videoCount++;
        else if (unit.type === "reading") readingCount++;
        else if (unit.type === "quiz") quizCount++;
        else if (unit.type === "assignment") assignmentCount++;
      });
    });
  });

  const totalHours = Math.round((totalDurationMinutes / 60) * 10) / 10;
  const hasCapstone = modules.some((m) =>
    m.topics.some((t) =>
      t.units.some((u) => /mini-project|capstone|final submission/i.test(u.title))
    )
  );

  const checklist: QaChecklistItem[] = [
    {
      id: "curriculum-depth",
      criterion: "Modular Curriculum Architecture",
      description: "Minimum 4 to 8 structured modules with discrete topical breakdowns.",
      required: ">= 4 Modules",
      found: `${modules.length} Modules`,
      status: modules.length >= 4 ? "pass" : "fail",
    },
    {
      id: "contact-hours",
      criterion: "Minimum Contact Duration",
      description: "Sufficient instructional volume for professional mastery certification.",
      required: ">= 10.0 Contact Hours",
      found: `${totalHours} Hours (${totalDurationMinutes} mins)`,
      status: totalHours >= 10 ? "pass" : "warn",
    },
    {
      id: "video-lectures",
      criterion: "Core & Application Video Lectures",
      description: "Multi-perspective conceptual and applied video lecture content.",
      required: ">= 10 Video Units",
      found: `${videoCount} Video Lectures`,
      status: videoCount >= 10 ? "pass" : "warn",
    },
    {
      id: "reading-notes",
      criterion: "Curated Technical Reading & Handouts",
      description: "Downloadable reading guides, formulation sheets, and case study notes.",
      required: ">= 8 Reading Units",
      found: `${readingCount} Reading Docs`,
      status: readingCount >= 8 ? "pass" : "warn",
    },
    {
      id: "formative-quizzes",
      criterion: "Formative Assessment Checks",
      description: "Concept quizzes with immediate learner scoring across topics.",
      required: ">= 4 Quizzes",
      found: `${quizCount} Concept Quizzes`,
      status: quizCount >= 4 ? "pass" : "fail",
    },
    {
      id: "practical-assignments",
      criterion: "Hands-on Practical Assignments",
      description: "Discipline-specific datasets, computational tasks, and analysis prompts.",
      required: ">= 4 Practical Assignments",
      found: `${assignmentCount} Assignments`,
      status: assignmentCount >= 4 ? "pass" : "fail",
    },
    {
      id: "capstone-project",
      criterion: "Summative Capstone / Mini-Project",
      description: "End-to-end synthesis deliverable for verified certificate issuance.",
      required: "Required for Certificate",
      found: hasCapstone ? "Verified Capstone Present" : "Missing Capstone",
      status: hasCapstone ? "pass" : "fail",
    },
  ];

  const passed = checklist.filter((c) => c.status === "pass").length;
  const score = Math.round((passed / checklist.length) * 100);

  const status =
    score === 100
      ? "Eligible & Verified"
      : score >= 70
      ? "Eligible with Recommendations"
      : "Needs Revision";

  return {
    score,
    status,
    totalDurationMinutes,
    totalHours,
    moduleCount: modules.length,
    topicCount,
    unitCount,
    videoCount,
    readingCount,
    quizCount,
    assignmentCount,
    hasCapstone,
    checklist,
  };
}
