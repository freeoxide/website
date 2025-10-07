use dioxus::prelude::*;
use crate::config;

#[component]
pub fn HomeScreen() -> Element {
    rsx! {
        div { class: "w-full max-w-4xl mx-auto flex flex-col min-h-screen",
            header { class: "text-center py-8",
                h1 { class: "text-4xl font-bold mb-4", "{config::SITE_NAME}"}
                h3 { class: "text-xl", "{config::TAGLINE}" }
            }
            div { class: "flex-1 flex items-center justify-center px-4",
                p { class: "text-lg text-center",
                    "Currently working on "
                    a { class: "underline",
                        href: "{config::PROJECTS[0].url}",
                        target: "_blank",
                        "{config::PROJECTS[0].name}"
                    }
                    "."
                }
            }
            footer { class: "text-center py-4",
                p { "© 2024 {config::SITE_NAME}" }
                p {
                    span { "Built by " }
                    a { class: "underline",
                        href: "{config::AUTHOR_LINK}",
                        target: "_blank",
                        "{config::AUTHOR}"
                    }
                }
            }
        }
    }
}
