import type { PropsWithChildren } from "react"
import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"
import {
  Sidebar as Sb,
  SidebarContent as SbContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
  {
    title: "Home",
    url: "#",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Calendar",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
]

function SidebarContent() {
  return (
    <Sb variant='sidebar'>
      <SbContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={(
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    )}
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SbContent>
    </Sb>
  )
}

export function Sidebar(props: PropsWithChildren<{}>) {
  return (
    <SidebarProvider>
      <SidebarContent />
      <div className="relative w-full min-h-screen">
        <div className="ml-8 h-full">
          { props.children }
        </div>
        <SidebarTrigger className="absolute top-0 left-0 m-4.5" />
      </div>
    </SidebarProvider>
  )
}
