use dioxus::prelude::*;

pub mod router;
pub mod screens;

fn main() {
    router::create_sitemap();

    dioxus::LaunchBuilder::new()
        .with_cfg(server_only! {
            dioxus::server::ServeConfig::builder()
                .incremental(
                    dioxus_isrg::IncrementalRendererConfig::new()
                        .static_dir(router::static_dir())
                        .clear_cache(false)
                )
                .enable_out_of_order_streaming()
        })
        .launch(App);
}

const TAILWIND_CSS: Asset = asset!("/assets/tailwind.css");

#[component]
fn App() -> Element {
    let title = "Freeoxide - Freedom and open source Rust based software tools";
    let description = "Freeoxide provides freedom and open source software tools built with Rust.";
    let domain = "https://freeoxide.com";

    rsx! {
        document::Title { "{title}" }
        document::Meta { name: "description", content: "{description}" }
        document::Meta { name: "keywords", content: "rust, open source, software tools, diy, home security" }
        document::Meta { name: "author", content: "hmziqrs" }
        document::Meta { property: "og:title", content: "{title}" }
        document::Meta { property: "og:description", content: "{description}" }
        document::Meta { property: "og:url", content: "{domain}" }
        document::Meta { property: "og:type", content: "website" }
        document::Meta { name: "twitter:card", content: "summary" }
        document::Meta { name: "twitter:title", content: "{title}" }
        document::Meta { name: "twitter:description", content: "{description}" }

        document::Link {
            rel: "preconnect",
            href: "https://fonts.googleapis.com"
        }
        document::Link {
            rel: "preconnect",
            href: "https://fonts.gstatic.com",
            "crossorigin": ""
        }
        document::Link {
            rel: "stylesheet",
            href: "https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400..600&family=Geist:wght@400..600&display=swap"
        }
        document::Link { rel: "stylesheet", href: TAILWIND_CSS }

        Router::<crate::router::Route> {}
    }
}
