"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Assuming search might be added later or for small screens
import { Menu, Search, Bell, MessageSquare, Plus, CalendarDays, Tag, ArrowLeft } from "lucide-react"; // Added CalendarDays for date icon, Tag icon, and ArrowLeft icon
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; // Assuming the left menu is still needed

// Updated Placeholder data structure for events
interface Event {
  id: string;
  title: string;
  date: string; // e.g., "June 7"
  time: string; // e.g., "15:00"
  category: "Academics" | "Career" | "Socials" | "Sports" | "Workshops" | "Clubs"; // Updated categories
  cost?: number; // Optional cost in pounds
  imageUrl: string;
  user: {
    name: string;
    avatarUrl: string;
  };
}

// Sample placeholder event data - university focused
const sampleEvents: Event[] = [
  {
    id: "1",
    title: "Introduction to AI Workshop",
    date: "June 10",
    time: "14:00",
    category: "Academics",
    cost: 10, // Example cost
    imageUrl: "/placeholder.svg?height=200&width=300", // Placeholder image
    user: { name: "Dr. Evans", avatarUrl: "/placeholder.svg?height=32&width=32" }, // Placeholder avatar
  },
  {
    id: "2",
    title: "Networking with Industry Leaders",
    date: "June 12",
    time: "18:30",
    category: "Career",
    cost: 0, // Free event
    imageUrl: "/placeholder.svg?height=200&width=300", // Placeholder image
    user: { name: "Career Services", avatarUrl: "/placeholder.svg?height=32&width=32" }, // Placeholder avatar
  },
  {
    id: "3",
    title: "Campus Movie Night: Inception",
    date: "June 14",
    time: "20:00",
    category: "Socials",
    imageUrl: "/placeholder.svg?height=200&width=300", // Placeholder image
    user: { name: "Student Union", avatarUrl: "/placeholder.svg?height=32&width=32" }, // Placeholder avatar
  },
  {
    id: "4",
    title: "Beginner Yoga Session",
    date: "June 15",
    time: "09:00",
    category: "Sports",
     cost: 5, // Example cost
    imageUrl: "/placeholder.svg?height=200&width=300", // Placeholder image
    user: { name: "Yoga Club", avatarUrl: "/placeholder.svg?height=32&width=32" }, // Placeholder avatar
  },
   {
    id: "5",
    title: "Coding for Beginners Workshop",
    date: "June 17",
    time: "10:00",
    category: "Workshops",
    imageUrl: "/placeholder.svg?height=200&width=300", // Placeholder image
    user: { name: "Computer Science Society", avatarUrl: "/placeholder.svg?height=32&width=32" }, // Placeholder avatar
  },
    {
    id: "6",
    title: "Photography Club Meetup",
    date: "June 19",
    time: "16:00",
    category: "Clubs",
    imageUrl: "/placeholder.svg?height=200&width=300", // Placeholder image
    user: { name: "Photography Club", avatarUrl: "/placeholder.svg?height=32&width=32" }, // Placeholder avatar
  },
];


export default function EventsPage() {
  const [activeFilter, setActiveFilter] = useState("All event"); // State to manage active filter
  const router = useRouter();

  // Updated filter options
  const filters: ("All event" | Event["category"])[] = ["All event", "Academics", "Career", "Socials", "Sports", "Workshops", "Clubs"];

  // Filter events based on active filter
  const filteredEvents = activeFilter === "All event"
    ? sampleEvents
    : sampleEvents.filter(event => event.category === activeFilter);

  // Helper function to get shadow color based on category with decreased opacity
  const getCategoryShadowColor = (category: Event["category"]) => {
    switch (category) {
      case "Academics": return "shadow-blue-500/30"; // Decreased opacity
      case "Career": return "shadow-green-500/30"; // Decreased opacity
      case "Socials": return "shadow-pink-500/30"; // Decreased opacity
      case "Sports": return "shadow-orange-500/30"; // Decreased opacity
      case "Workshops": return "shadow-purple-500/30"; // Decreased opacity
      case "Clubs": return "shadow-teal-500/30"; // Decreased opacity
      default: return "shadow-gray-200"; // Default shadow also slightly reduced
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        {/* Back button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/feed')}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 flex-grow">Upcoming events</h1>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide"> {/* Added scrollbar-hide utility if available */}
        {filters.map(filter => (
          <Button
            key={filter}
            variant={activeFilter === filter ? "default" : "outline"}
            className={activeFilter === filter ? "bg-primary-purple hover:bg-primary-purple/90 text-white rounded-full" : "text-gray-700 rounded-full border-gray-300"} // Added rounded-full and border color
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </Button>
        ))}
      </div>

      {/* Events List Container */}
      {/* Using a responsive grid that adjusts columns based on screen size */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Mapping over filtered events to display cards */}
        {filteredEvents.map(event => (
          <div
            key={event.id}
            // Combined gradient background with category-based shadow with decreased opacity
            className={`relative rounded-lg overflow-hidden shadow-lg border-none bg-gradient-to-r from-primary-purple/5 to-secondary-pink/5 transition-all duration-200 ${getCategoryShadowColor(event.category)}`} // Added category-based shadow class
          >
            {/* Event Image */}
            <div className="w-full h-40 sm:h-48 lg:h-56 relative"> {/* Adjust height as needed */}
                <Image
                    src={event.imageUrl}
                    alt={event.title}
                    layout="fill" // Use fill to cover the container
                    objectFit="cover" // Cover the area without distorting aspect ratio
                    className="rounded-t-lg" // Rounded top corners
                />
                {/* Category Tag Overlay */}
                 <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold text-white
                    ${event.category === "Academics" ? "bg-blue-600"
                     : event.category === "Career" ? "bg-green-600"
                     : event.category === "Socials" ? "bg-pink-600"
                     : event.category === "Sports" ? "bg-orange-600"
                     : event.category === "Workshops" ? "bg-purple-600"
                     : event.category === "Clubs" ? "bg-teal-600"
                     : "bg-gray-600" // Default color
                    }
                 `}>
                   #{event.category}
                 </span>
            </div>


            {/* Event Details */}
            <div className="p-4 bg-white"> {/* Background white for content */}
                {/* User Avatar and Name */}
                 <div className="flex items-center mb-2">
                    <div className="relative h-6 w-6 overflow-hidden rounded-full mr-2">
                        <Image
                            src={event.user.avatarUrl}
                            alt={event.user.name}
                            width={24}
                            height={24}
                            className="object-cover"
                        />
                    </div>
                    <span className="text-sm font-medium text-gray-800">{event.user.name}</span>
                 </div>
                <h3 className="font-bold text-lg text-gray-900">{event.title}</h3>
                {/* Date, Time, and Cost */}
                <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
                     <div className="flex items-center">
                         <CalendarDays className="h-4 w-4 mr-1 text-gray-500" />
                         <span>{event.date} at {event.time}</span>
                     </div>
                     {event.cost !== undefined && ( // Only show cost if defined
                         <div className="flex items-center">
                             <Tag className="h-4 w-4 mr-1 text-gray-500" /> {/* Using Tag icon for cost */}
                             <span>{event.cost === 0 ? "Free" : `₹${event.cost}`}</span> {/* Display "Free" or cost */}
                         </div>
                     )}
                </div>
            </div>
          </div>
        ))}
      </div>

       {/* Floating Action Button */}
       {/* Positioned fixed at bottom right */}
       <Button
         size="icon"
         className="fixed bottom-6 right-6 rounded-full h-14 w-14 bg-primary-purple hover:bg-primary-purple/90 shadow-lg"
         // Add onClick handler to open a modal or navigate to a create event page
       >
         <Plus className="h-6 w-6 text-white" />
       </Button>
    </div>
  );
}
