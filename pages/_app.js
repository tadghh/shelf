import MainNavigation from "@/components/layout/main-navigation";
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
	return (
		<MainNavigation>
			<Component {...pageProps} />
		</MainNavigation>
	);
}
