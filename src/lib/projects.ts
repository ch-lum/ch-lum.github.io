export interface Project {
  title: string;
  description: string;
  image: string;
  link: string;
  tags: string[];
}

export const projects: Project[] = [
  {
    title:
      "Privacy in Practice: The Feasibility of Differential Privacy for Telemetry Analysis",
    description:
      "Replicated four analysis papers on Intel Telemetry data using differential privacy to pioneer DP in telemetry analysis.",
    image: "/images/banners/privacy_banner.jpg",
    link: "https://ch-lum.github.io/privacy-in-practice/",
    tags: ["Research", "Differential Privacy", "Telemetry Analysis"],
  },
  {
    title:
      "“I’m not sure, but...”: Expert Practices that Enable Effective Code Comprehension in Data Science",
    description:
      "Christopher Lum*, Guoxuan Xu*, Sam Lau (*equal contribution). ACM Technical Symposium on Computer Science Education (SIGCSE), 2025.",
    image: "/images/banners/sigcse_paper_banner.jpg",
    link: "/documents/2025_sigcse_experts_vs_novices_SIGCSE.pdf",
    tags: ["Research", "Data Science Pedagogy", "SIGCSE 2025"],
  },
  {
    title: "ClassBuzz",
    description:
      "Led a team of undergraduates to develop an in-class polling tool used by 400+ students quarterly in HDSI.",
    image: "/images/banners/classbuzz_banner.jpg",
    link: "https://tryclassbuzz.com",
    tags: ["Full Stack", "Next.JS", "Educational Technology"],
  },
  {
    title: "Comment Section Sentiment Analysis",
    description:
      "Visualization of positive and negative comments from a Facebook comment section.",
    image: "/images/banners/comment_vis_banner.jpg",
    link: "https://ch-lum.github.io/comment-vis/",
    tags: ["D3.js", "Sentiment Analysis", "Data Visualization"],
  },
  {
    title: "Pandas Tutor",
    description:
      "A tool to visualize Pandas table manipulations used at UC San Diego intro data science courses. I made the memory management more efficient so it can be used with larger datasets.",
    image: "/images/banners/pandas_tutor_banner.jpg",
    link: "https://pandastutor.com/",
    tags: ["Backend", "Educational Technology", "Pandas"],
  },
  {
    title: "San Diego Parking Meters",
    description:
      "Explore San Diego's neighborhoods by when and where people park.",
    image: "/images/banners/parking_banner.jpg",
    link: "https://ch-lum.github.io/sd-parking/",
    tags: ["D3.js", "Frontend", "Data Visualization"],
  },
  // More projects here
];
