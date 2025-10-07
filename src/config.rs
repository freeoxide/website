pub const DOMAIN: &str = "https://freeoxide.com";
pub const SITE_NAME: &str = "Freeoxide";
pub const TAGLINE: &str = "Freedom and open source Rust based software tools";
pub const TITLE: &str = "Freeoxide - Freedom and open source Rust based software tools";
pub const DESCRIPTION: &str = "Freeoxide provides freedom and open source software tools built with Rust.";
pub const KEYWORDS: &str = "rust, open source, software tools, diy, home security";
pub const AUTHOR: &str = "hmziqrs";
pub const AUTHOR_LINK: &str = "https://hmziq.rs";

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
    url: "https://github.com/freeoxide/pi-door-security",
    github: "https://github.com/freeoxide/pi-door-security",
}];
