use dioxus::prelude::*;

#[component]
pub fn HomeScreen() -> Element {
    rsx! {
        div {
            header {
                h1 { "Freeoxide"}
                h3 { "Freedom and open source Rust based software tools" }
            }
            div {
                p {
                    "Currently working on DIY home security system."
                }
            }
            footer {
                p { "© 2024 Freeoxide" }
                p {
                    span { "Built by " }
                    a {
                        href: "https://hmziq.rs",
                        target: "_blank",
                        "Hmziqrs"
                    }
                }
            }
        }
    }
}
