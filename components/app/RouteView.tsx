"use client";

import { usePathname } from "next/navigation";
import { routeSegments } from "@/lib/i18n";
import { PageTransition } from "@/components/motion/PageTransition";
import HomeView from "@/components/pages/HomeView";
import AboutView from "@/components/pages/AboutView";
import ProductsView from "@/components/pages/ProductsView";
import BlogView from "@/components/pages/BlogView";
import ProjectsView from "@/components/pages/ProjectsView";
import ContactsView from "@/components/pages/ContactsView";
import ProductView from "@/components/pages/ProductDetailView";
import PostView from "@/components/pages/PostDetailView";
import ProjectView from "@/components/pages/ProjectDetailView";
import LoginView from "@/components/pages/LoginView";
import RegisterView from "@/components/pages/RegisterView";
import AccountView from "@/components/pages/AccountView";
import CartView from "@/components/pages/CartView";
import KitsView from "@/components/pages/KitsView";
import KitDetailView from "@/components/pages/KitDetailView";
import NotFoundView from "@/components/pages/NotFoundView";

/** Клиентский роутер SPA: сопоставляет путь (после локали) с представлением. */
function render(seg: string[]): React.ReactNode {
  const [route, slug] = seg;
  switch (route) {
    case undefined:
      return <HomeView />;
    case "about":
      return <AboutView />;
    case "products":
      return <ProductsView />;
    case "blog":
      return <BlogView />;
    case "projects":
      return <ProjectsView />;
    case "contacts":
      return <ContactsView />;
    case "login":
      return <LoginView />;
    case "register":
      return <RegisterView />;
    case "account":
      return <AccountView />;
    case "cart":
      return <CartView />;
    case "kits":
      return <KitsView />;
    case "kit":
      return slug ? <KitDetailView slug={decodeURIComponent(slug)} /> : <NotFoundView />;
    case "product":
      return slug ? <ProductView slug={decodeURIComponent(slug)} /> : <NotFoundView />;
    case "post":
      return slug ? <PostView slug={decodeURIComponent(slug)} /> : <NotFoundView />;
    case "project":
      return slug ? <ProjectView slug={decodeURIComponent(slug)} /> : <NotFoundView />;
    default:
      return <NotFoundView />;
  }
}

export default function RouteView() {
  const pathname = usePathname();
  const seg = routeSegments(pathname);
  // key по пути — перезапуск входной анимации при каждой смене маршрута.
  return <PageTransition key={pathname}>{render(seg)}</PageTransition>;
}
