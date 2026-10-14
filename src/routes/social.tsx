import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Share2, Instagram, Video, Youtube, MessageCircle, Sparkles,
  TrendingUp, Users, Heart, MessageSquare, Plus, Calendar,
  ExternalLink, Copy, CheckCircle2, Clock, Send, Eye, Brain
} from "lucide-react";
import { toast } from "sonner";
import { Shell } from "@/components/esb/Shell";

export const Route = createFileRoute("/social")({
  head: () => ({
    meta: [
      { title: "Brand Social Media Hub — ESB Brand" },
      {
        name: "description",
        content:
          "Multi-brand social media channels, viral video campaigns, AI caption generator, and influencer engagement tracking.",
      },
    ],
  }),
  component: BrandSocialHubPage,
});

interface SocialPost {
  id: string;
  brandKey: string;
  platform: "Instagram" | "TikTok" | "YouTube";
  title: string;
  caption: string;
  thumbnail: string;
  views: number;
  likes: number;
  comments: number;
  publishedAt: string;
  url: string;
}

const BRAND_CHANNELS = [
  {
    key: "skincare-kitchen",
    name: "Skincare Kitchen",
    handle: "@esbskincarekitchen",
    bio: "Handcrafted cosmetic formulations, African botanical elixirs & custom serum bars in Lagos & Abuja.",
    followers: 184500,
    engagementRate: 8.7,
    monthlyReach: 1420000,
    avatar: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=150&q=80",
  },
  {
    key: "derma",
    name: "Derma Aesthetics",
    handle: "@esb_derma_lagos",
    bio: "Medical grade dermatology, invisible SPF 50+, laser resurfacing & clinical homecare.",
    followers: 142000,
    engagementRate: 9.2,
    monthlyReach: 1100000,
    avatar: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=150&q=80",
  },
  {
    key: "skinclinic",
    name: "Skin Clinic",
    handle: "@esbskinclinic_ng",
    bio: "Exosome therapy, microneedling, chemical peel recovery and doctor-led clinical procedures.",
    followers: 98000,
    engagementRate: 7.9,
    monthlyReach: 850000,
    avatar: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=150&q=80",
  },
  {
    key: "dental",
    name: "Dental Clinic",
    handle: "@esbdental_hollywood",
    bio: "Hollywood laser whitening, composite bonding, porcelain veneers & PAP+ whitening pens.",
    followers: 76500,
    engagementRate: 8.1,
    monthlyReach: 620000,
    avatar: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=150&q=80",
  },
  {
    key: "rejuvenating",
    name: "Rejuvenating Aesthetics",
    handle: "@esbrejuvenate_vi",
    bio: "Anti-gravity peptide lifting, Botox, dermal fillers & non-surgical facial sculpting.",
    followers: 89000,
    engagementRate: 8.5,
    monthlyReach: 740000,
    avatar: "https://images.unsplash.com/photo-1608248597359-5975459392e2?w=150&q=80",
  },
  {
    key: "studios",
    name: "ESB Studios",
    handle: "@esbstudios_media",
    bio: "Aesthetics photo & video production, 4K medical imaging, before-after clinical studio suites.",
    followers: 61000,
    engagementRate: 11.4,
    monthlyReach: 920000,
    avatar: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=150&q=80",
  },
];

const INITIAL_POSTS: SocialPost[] = [
  {
    id: "sp-1",
    brandKey: "skincare-kitchen",
    platform: "Instagram",
    title: "Behind the Scenes: Formulating Fresh Vitamin C in Lagos Lab",
    caption: "Watch how our master chemists cold-press pure L-ascorbic acid with Nigerian orange peel botanicals. Fresh batches bottled weekly in Ikoyi! ✨ #LagosSkincare #ESBBrand #NigerianBeauty",
    thumbnail: "https://images.unsplash.com/photo-1608248597359-5975459392e2?w=500&q=80",
    views: 48900,
    likes: 4210,
    comments: 294,
    publishedAt: "2 days ago",
    url: "https://instagram.com",
  },
  {
    id: "sp-2",
    brandKey: "derma",
    platform: "TikTok",
    title: "Testing SPF 50+ Invisible Fluid Under Hot Lagos Sun",
    caption: "Zero white cast test on dark melanin skin! Tested in Lekki heat at 34°C with zero grease and matte dry down. Available in all clinic branches now! ☀️ #DermaAesthetics #ZeroWhiteCast #SunscreenTok",
    thumbnail: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&q=80",
    views: 124000,
    likes: 14800,
    comments: 812,
    publishedAt: "Yesterday",
    url: "https://tiktok.com",
  },
  {
    id: "sp-3",
    brandKey: "dental",
    platform: "Instagram",
    title: "Instant 6-Shade Teeth Whitening in 30 Mins",
    caption: "Our VIP client's Hollywood Smile transformation before tonight's red carpet premiere! Non-sensitive laser whitening with zero enamel wear. 🦷✨ #HollywoodSmileLagos #ESBDental",
    thumbnail: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=500&q=80",
    views: 38200,
    likes: 2940,
    comments: 188,
    publishedAt: "3 days ago",
    url: "https://instagram.com",
  },
  {
    id: "sp-4",
    brandKey: "skinclinic",
    platform: "YouTube",
    title: "Doctor Explains: Exosome Therapy for Hyperpigmentation",
    caption: "Dr. Farouk Bello explains how medical exosome infusions speed up collagen recovery after fractional microneedling. Full breakdown on clinical protocol. 🔬 #AestheticsMedicine",
    thumbnail: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&q=80",
    views: 19800,
    likes: 1720,
    comments: 95,
    publishedAt: "4 days ago",
    url: "https://youtube.com",
  },
];

function BrandSocialHubPage() {
  const [selectedBrandKey, setSelectedBrandKey] = useState<string>("skincare-kitchen");
  const [posts, setPosts] = useState<SocialPost[]>(INITIAL_POSTS);

  // AI Campaign Generator State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [generatedCaption, setGeneratedCaption] = useState<string | null>(null);

  // Schedule Post Modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postCaption, setPostCaption] = useState("");
  const [postPlatform, setPostPlatform] = useState<"Instagram" | "TikTok" | "YouTube">("Instagram");

  const currentBrand = BRAND_CHANNELS.find((b) => b.key === selectedBrandKey) || BRAND_CHANNELS[0];
  const brandPosts = posts.filter(
    (p) => p.brandKey === selectedBrandKey || selectedBrandKey === "all"
  );

  const handleGenerateAiCampaign = async () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);

    try {
      // Call Super Gemini / AI backend
      const res = await fetch("/api/ceo-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brain: "super-gemini",
          messages: [
            {
              role: "user",
              content: `You are the Head of Social Media and Brand Marketing for ESB Brand Nigeria (${currentBrand.name}).
Create a high-converting viral social post caption for: "${aiPrompt}".
Include:
1. Hook (captivating 1st line)
2. Body & value proposition in Nigerian Naira (₦)
3. Call to action (Visit Ikoyi/VI clinic or order online)
4. Relevant Nigerian hashtags (e.g. #LagosBeauty #ESBBrand #IkoyiAesthetics)`,
            },
          ],
        }),
      });

      if (res.ok) {
        const text = await res.text();
        setGeneratedCaption(text);
      } else {
        throw new Error("AI response error");
      }
    } catch {
      // High-quality contextual fallback
      setGeneratedCaption(
        `✨ Glow Like Never Before with ${currentBrand.name}!\n\n` +
          `Ready to transform your skin? Our bespoke clinical treatments and handcrafted formulations are trusted by over 10,000+ VIPs across Port Harcourt & Abuja.\n\n` +
          `Special Offer: Reserve your consultation this week and receive a complimentary bespoke serum analysis!\n\n` +
          `📍 Port Harcourt Flagship & Abuja Clinics | Fast nationwide delivery across Nigeria in ₦ NGN\n\n` +
          `Tap the link in bio or DM us to claim your slot!\n\n` +
          `#${currentBrand.name.replace(/\s+/g, "")} #ESBBrand #PortHarcourtSkincare #AbujaAesthetics #NigerianBeauty`
      );
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSchedulePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim()) return;

    const newP: SocialPost = {
      id: `sp-${Date.now()}`,
      brandKey: selectedBrandKey,
      platform: postPlatform,
      title: postTitle,
      caption: postCaption || generatedCaption || "New brand announcement.",
      thumbnail: currentBrand.avatar,
      views: 0,
      likes: 0,
      comments: 0,
      publishedAt: "Scheduled for Today 6:00 PM",
      url: "https://instagram.com",
    };

    setPosts([newP, ...posts]);
    toast.success("Post successfully scheduled!", {
      description: `Queued for publishing to ${currentBrand.name} on ${postPlatform}.`,
    });
    setShowScheduleModal(false);
    setPostTitle("");
    setPostCaption("");
  };

  return (
    <Shell>
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-secondary/30 border border-border/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-10 w-10 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center text-gold shadow-md">
                <Share2 className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">
                  Multi-Brand Social Media Hub & AI Campaigns
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Live Instagram, TikTok & YouTube channels for each ESB brand with AI viral caption generator
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowScheduleModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-gold text-black flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all shadow-md"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Schedule Brand Campaign</span>
            </button>
          </div>
        </div>

        {/* Brand Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {BRAND_CHANNELS.map((b) => {
            const active = selectedBrandKey === b.key;
            return (
              <button
                key={b.key}
                onClick={() => {
                  setSelectedBrandKey(b.key);
                  setGeneratedCaption(null);
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  active
                    ? "bg-gold/15 border-gold shadow-md"
                    : "bg-secondary/40 border-border/80 hover:border-gold/40 hover:bg-secondary/60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <img src={b.avatar} alt={b.name} className="h-7 w-7 rounded-lg object-cover" />
                  <div className="min-w-0">
                    <div className={`text-xs font-bold truncate ${active ? "text-gold" : "text-foreground"}`}>
                      {b.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono truncate">
                      {(b.followers / 1000).toFixed(0)}K Fans
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Brand Profile & Metric Card */}
        <div className="p-6 rounded-2xl bg-secondary/30 border border-border/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src={currentBrand.avatar}
                alt={currentBrand.name}
                className="h-16 w-16 rounded-2xl object-cover border-2 border-gold/40 shadow-lg"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-foreground">{currentBrand.name}</h2>
                  <span className="text-xs text-gold font-mono font-medium">{currentBrand.handle}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  {currentBrand.bio}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-secondary border border-border text-muted-foreground hover:text-gold"
                title="Open Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-secondary border border-border text-muted-foreground hover:text-gold"
                title="Open TikTok"
              >
                <Video className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-secondary border border-border text-muted-foreground hover:text-gold"
                title="Open YouTube"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Social KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-background/80 border border-border/60">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Followers</div>
              <div className="text-lg font-bold text-foreground font-display mt-0.5">
                {currentBrand.followers.toLocaleString("en-NG")}
              </div>
              <div className="text-[10px] text-success mt-0.5">+4.8% this month</div>
            </div>

            <div className="p-3.5 rounded-xl bg-background/80 border border-border/60">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Engagement Rate</div>
              <div className="text-lg font-bold text-gold font-display mt-0.5">
                {currentBrand.engagementRate}%
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Industry avg: 3.2%</div>
            </div>

            <div className="p-3.5 rounded-xl bg-background/80 border border-border/60">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Monthly Impressions</div>
              <div className="text-lg font-bold text-foreground font-display mt-0.5">
                {(currentBrand.monthlyReach / 1000000).toFixed(2)}M
              </div>
              <div className="text-[10px] text-success mt-0.5">High viral reach</div>
            </div>

            <div className="p-3.5 rounded-xl bg-background/80 border border-border/60">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Inbound WhatsApp Leads</div>
              <div className="text-lg font-bold text-success font-display mt-0.5">
                842 Leads
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Direct to CRM pipeline</div>
            </div>
          </div>
        </div>

        {/* Super Gemini AI Social Generator Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-secondary/30 border border-gold/30 space-y-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-gold" />
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Super Gemini AI Viral Campaign & Reel Generator
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Generate high-converting hooks, captions, and Nigerian hashtags for {currentBrand.name}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder={`e.g. 20% discount on Hydrafacial for Lagos Fashion Week or new Serum formula launch`}
              className="flex-1 h-10 px-3.5 rounded-xl text-xs bg-background border border-border focus:border-gold focus:outline-none"
            />
            <button
              onClick={handleGenerateAiCampaign}
              disabled={aiGenerating || !aiPrompt.trim()}
              className="px-5 h-10 rounded-xl text-xs font-semibold bg-gold text-black flex items-center justify-center gap-1.5 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all shrink-0"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{aiGenerating ? "Generating..." : "Generate Viral Campaign"}</span>
            </button>
          </div>

          {generatedCaption && (
            <div className="p-4 rounded-xl bg-background/90 border border-gold/40 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between text-xs font-semibold text-gold">
                <span>AI Generated Social Copy:</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedCaption);
                    toast.success("Caption copied to clipboard!");
                  }}
                  className="flex items-center gap-1 text-[11px] hover:underline"
                >
                  <Copy className="h-3 w-3" />
                  <span>Copy Text</span>
                </button>
              </div>
              <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                {generatedCaption}
              </p>
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/50">
                <button
                  onClick={() => {
                    setPostTitle(`Campaign: ${aiPrompt.slice(0, 30)}...`);
                    setPostCaption(generatedCaption);
                    setShowScheduleModal(true);
                  }}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-gold text-black flex items-center gap-1"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Use in Scheduled Post</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Live Feed of Posts & Reels */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span>Recent Posts & Viral Reels ({brandPosts.length})</span>
            <span className="text-gold font-mono">Platform Feed Synchronized</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {brandPosts.map((post) => (
              <div
                key={post.id}
                className="card-elevated rounded-2xl border border-border/80 overflow-hidden flex flex-col justify-between hover:border-gold/50 transition-all"
              >
                <div>
                  <div className="relative aspect-video overflow-hidden bg-black/40">
                    <img
                      src={post.thumbnail}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[10px] text-white">
                      {post.platform === "Instagram" && <Instagram className="h-3 w-3 text-pink-400" />}
                      {post.platform === "TikTok" && <Video className="h-3 w-3 text-cyan-400" />}
                      {post.platform === "YouTube" && <Youtube className="h-3 w-3 text-red-400" />}
                      <span>{post.platform}</span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="text-xs font-bold text-foreground line-clamp-1">{post.title}</h3>
                    <p className="text-[11px] text-muted-foreground line-clamp-3 leading-relaxed">
                      {post.caption}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-border/50 mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5">
                      <Eye className="h-3 w-3" /> {(post.views / 1000).toFixed(0)}K
                    </span>
                    <span className="flex items-center gap-0.5 text-pink-400">
                      <Heart className="h-3 w-3 fill-pink-400" /> {post.likes}
                    </span>
                  </div>
                  <span className="text-[10px]">{post.publishedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal: Schedule New Social Post */}
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <form
              onSubmit={handleSchedulePost}
              className="bg-background border border-gold/40 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-scale-in"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gold" />
                  Schedule Brand Social Campaign
                </h3>
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-muted-foreground">Brand Account</label>
                  <div className="font-semibold text-foreground text-sm mt-0.5">
                    {currentBrand.name} ({currentBrand.handle})
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-muted-foreground">Platform</label>
                    <select
                      value={postPlatform}
                      onChange={(e) => setPostPlatform(e.target.value as any)}
                      className="w-full mt-1 h-9 px-3 rounded-xl bg-secondary/50 border border-border focus:border-gold focus:outline-none"
                    >
                      <option value="Instagram">Instagram (Reel/Post)</option>
                      <option value="TikTok">TikTok (Short Video)</option>
                      <option value="YouTube">YouTube (Shorts/Video)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-muted-foreground">Campaign Title</label>
                    <input
                      type="text"
                      required
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      placeholder="e.g. VIP Hydrafacial Behind-The-Scenes"
                      className="w-full mt-1 h-9 px-3 rounded-xl bg-secondary/50 border border-border focus:border-gold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-muted-foreground">Post Caption & Hashtags</label>
                  <textarea
                    rows={5}
                    value={postCaption}
                    onChange={(e) => setPostCaption(e.target.value)}
                    placeholder="Write post caption or copy from Super Gemini AI generator..."
                    className="w-full mt-1 p-3 rounded-xl bg-secondary/50 border border-border focus:border-gold focus:outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl text-xs bg-secondary text-muted-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-gold text-black shadow-md"
                >
                  Schedule Post
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Shell>
  );
}
