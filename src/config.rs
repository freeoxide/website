pub const DOMAIN: &str = "https://freeoxide.com";
pub const TITLE: &str = "Freeoxide - Freedom and open source Rust based software tools";
pub const DESCRIPTION: &str = "Freeoxide provides freedom and open source software tools built with Rust.";
pub const KEYWORDS: &str = "rust, open source, software tools, diy, home security";
pub const AUTHOR: &str = "hmziqrs";

#[derive(Debug, Clone)]
pub struct Project {
    pub name: &'static str,
    pub description: &'static str,
    pub url: &'static str,
    pub github: &'static str,
}

pub const PROJECTS: [Project; 1] = [Project {
    name: "DIY door alarm system",
    description: "A DIY full stack door alarm system including mobile app, web app, dashboard, and e2e realtime client server communication.",
    url: "https://freeoxide.com",
    github: "https://github.com/freeoxide/home-security",
}];
