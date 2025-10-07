use dioxus::prelude::*;

#[component]
pub fn HomeScreen() -> Element {
    rsx! {
        div {
            h1 { "Freeoxide"}
            h3 { "Free and open source Rust based software tools" }
        }
    }
}
