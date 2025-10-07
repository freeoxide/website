use dioxus::prelude::*;

#[component]
pub fn HomeScreen() -> Element {
    rsx! {
        div { class: "w-full max-w-4xl mx-auto flex flex-col min-h-screen",
            header { class: "text-center py-8",
                h1 { class: "text-4xl font-bold mb-4", "Freeoxide"}
                h3 { class: "text-xl", "Freedom and open source Rust based software tools" }
            }
            div { class: "flex-1 flex items-center justify-center px-4",
                p { class: "text-lg text-center",
                    "Currently working on DIY home security system."
                }
            }
            footer { class: "text-center py-4",
                p { "© 2024 Freeoxide" }
                p {
                    span { "Built by " }
                    a { class: "underline",
                        href: "https://hmziq.rs",
                        target: "_blank",
                        "Hmziqrs"
                    }
                }
            }
        }
    }
}
