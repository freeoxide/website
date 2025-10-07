use dioxus::prelude::*;

pub mod router;
pub mod screens;
pub mod config;

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
    rsx! {
        document::Title { "{config::TITLE}" }
        document::Meta { name: "description", content: "{config::DESCRIPTION}" }
        document::Meta { name: "keywords", content: "{config::KEYWORDS}" }
        document::Meta { name: "author", content: "{config::AUTHOR}" }
        document::Meta { property: "og:title", content: "{config::TITLE}" }
        document::Meta { property: "og:description", content: "{config::DESCRIPTION}" }
        document::Meta { property: "og:url", content: "{config::DOMAIN}" }
        document::Meta { property: "og:type", content: "website" }
        document::Meta { name: "twitter:card", content: "summary" }
        document::Meta { name: "twitter:title", content: "{config::TITLE}" }
        document::Meta { name: "twitter:description", content: "{config::DESCRIPTION}" }

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
