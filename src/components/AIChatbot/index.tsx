import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Mail, Phone, ChevronRight, Bot, RotateCcw } from 'lucide-react';
import { profile } from '../../config/profile';
import styles from './AIChatbot.module.css';

interface Message {
  role: 'user' | 'agent';
  content: string;
  chips?: string[];
}

const INITIAL_SUGGESTIONS = [
  "Tell me about your projects",
  "What are your skills?",
  "Show me your GitHub",
  "How can I hire you?"
];

interface GithubRepo {
  name: string;
  description: string;
  html_url: string;
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [offsets, setOffsets] = useState<Record<string, number>>({
    ai: 0,
    data: 0,
    web: 0,
    three: 0,
    live: 0
  });
  const initialMessage: Message = {
    role: 'agent',
    content: `Hi there! I'm Whizz, VPIXCEL's interactive assistant. I know all about Vimal's projects, skills, and experience. What would you like to know?`
  };
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-chatbot', handleOpen);
    return () => window.removeEventListener('open-chatbot', handleOpen);
  }, []);

  useEffect(() => {
    // Fetch user's github repos for dynamic answering
    fetch('https://api.github.com/users/vimal2645/repos?per_page=100')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRepos(data);
        }
      })
      .catch(err => console.error('Failed to fetch github repos', err));
  }, []);

  const generateResponse = (text: string): { content: string, chips: string[] } => {
    const lower = text.toLowerCase();
    
    // Keyword based semantic matching
    if (lower.match(/(hire|contact|freelance|work together|talk|email)/)) {
      return {
        content: `Vimal is currently <strong>${profile.availability.toLowerCase()}</strong>! You can email him directly at <a href="mailto:${profile.email}">${profile.email}</a> or connect via <a href="${profile.socialLinks.linkedin}" target="_blank">LinkedIn</a>.`,
        chips: ["Tell me about your projects", "What are your skills?"]
      };
    } 

    if (lower.match(/(live products|live|demo|deployed)/)) {
      const p1 = profile.featuredProjects[0];
      const p2 = profile.featuredProjects[1];
      return {
        content: `Vimal has built several production-ready Live Products! <br/><br/>• <strong>${p1.title}</strong>: ${p1.outcome}. <br/><a href="${p1.live}" target="_blank" style="color:var(--accent); text-decoration:underline;">[View Live Demo]</a><br/><br/>• <strong>${p2.title}</strong>: ${p2.outcome}. <br/><a href="${p2.live}" target="_blank" style="color:var(--accent); text-decoration:underline;">[View Live Demo]</a>`,
        chips: ["AI Projects", "Data Science Projects", "Show me your GitHub"]
      };
    } 

    if (lower.match(/(scrap|scraper|beautifulsoup|selenium|playwright|extract)/)) {
      return {
        content: `During his internship, Vimal built highly robust enterprise web scrapers!<br/><br/>• <strong>BigBasket Scraper</strong><br/>• <strong>Job Board Scraper</strong><br/>• <strong>Google Maps Scraper</strong><br/><br/>He uses tools like <strong>Selenium, Playwright, and BeautifulSoup</strong>. The code is private for clients, but he can absolutely build custom data pipelines for you!`,
        chips: ["How can I hire you?", "Data Science Projects", "What are your skills?"]
      };
    }
    
    // Category specific project queries
    if (lower.match(/(ai projects|ai|rag|llm|ocr|model|machine learning)/) && lower.includes('project')) {
      const aiKeywords = ['ai', 'rag', 'llm', 'chat', 'bot', 'ocr', 'model', 'nlp', 'vision', 'gpt'];
      const allMatches = repos.filter(r => aiKeywords.some(k => r.name.toLowerCase().includes(k) || (r.description && r.description.toLowerCase().includes(k))));
      const currentOffset = offsets.ai;
      const matches = allMatches.slice(currentOffset, currentOffset + 3);
      
      let html = `Here are some of Vimal's <strong>AI & LLM Projects</strong> (Showing ${currentOffset + 1}-${Math.min(currentOffset + 3, allMatches.length)} of ${allMatches.length}):<br/><br/>`;
      matches.forEach(m => {
        html += `• <strong>${m.name}</strong>: <a href="${m.html_url}" target="_blank" style="color:var(--accent); text-decoration:underline;">[View on GitHub]</a><br/>`;
      });
      
      const hasMore = currentOffset + 3 < allMatches.length;
      if (hasMore) setOffsets(prev => ({ ...prev, ai: prev.ai + 3 }));
      
      return { 
        content: matches.length > 0 ? html : "I couldn't find specific AI repos at the moment, but Vimal specializes in RAG and LLMs!", 
        chips: hasMore ? ["More AI Projects", "Data Science Projects", "Live Products"] : ["Data Science Projects", "Full Stack Projects", "Live Products"] 
      };
    }

    if (lower.match(/(data science|data|pipeline|analysis)/) && lower.includes('project')) {
      const dataKeywords = ['data', 'science', 'pipeline', 'analysis', 'pandas', 'scrap', 'etl'];
      const allMatches = repos.filter(r => dataKeywords.some(k => r.name.toLowerCase().includes(k) || (r.description && r.description.toLowerCase().includes(k))));
      const currentOffset = offsets.data;
      const matches = allMatches.slice(currentOffset, currentOffset + 3);
      
      let html = `Here are some of Vimal's <strong>Data Science & Pipeline Projects</strong> (Showing ${currentOffset + 1}-${Math.min(currentOffset + 3, allMatches.length)} of ${allMatches.length}):<br/><br/>`;
      matches.forEach(m => {
        html += `• <strong>${m.name}</strong>: <a href="${m.html_url}" target="_blank" style="color:var(--accent); text-decoration:underline;">[View on GitHub]</a><br/>`;
      });

      const hasMore = currentOffset + 3 < allMatches.length;
      if (hasMore) setOffsets(prev => ({ ...prev, data: prev.data + 3 }));

      return { 
        content: matches.length > 0 ? html : "I couldn't find specific Data Science repos at the moment.", 
        chips: hasMore ? ["More Data Science Projects", "AI Projects", "Live Products"] : ["AI Projects", "Full Stack Projects", "Live Products"] 
      };
    }

    if (lower.match(/(full stack|web|frontend|backend|react|next)/) && lower.includes('project')) {
      const webKeywords = ['react', 'next', 'web', 'fullstack', 'backend', 'frontend', 'app', 'node'];
      const allMatches = repos.filter(r => webKeywords.some(k => r.name.toLowerCase().includes(k) || (r.description && r.description.toLowerCase().includes(k))));
      const currentOffset = offsets.web;
      const matches = allMatches.slice(currentOffset, currentOffset + 3);
      
      let html = `Here are some of Vimal's <strong>Full Stack Web Projects</strong> (Showing ${currentOffset + 1}-${Math.min(currentOffset + 3, allMatches.length)} of ${allMatches.length}):<br/><br/>`;
      matches.forEach(m => {
        html += `• <strong>${m.name}</strong>: <a href="${m.html_url}" target="_blank" style="color:var(--accent); text-decoration:underline;">[View on GitHub]</a><br/>`;
      });

      const hasMore = currentOffset + 3 < allMatches.length;
      if (hasMore) setOffsets(prev => ({ ...prev, web: prev.web + 3 }));

      return { 
        content: matches.length > 0 ? html : "I couldn't find specific Web repos at the moment.", 
        chips: hasMore ? ["More Full Stack Projects", "3D Web Projects", "Live Products"] : ["AI Projects", "3D Web Projects", "Live Products"] 
      };
    }

    if (lower.match(/(3d|three|gsap|webgl|animation)/) && lower.includes('project')) {
      const threeKeywords = ['3d', 'three', 'gsap', 'webgl', 'animation', 'canvas'];
      const allMatches = repos.filter(r => threeKeywords.some(k => r.name.toLowerCase().includes(k) || (r.description && r.description.toLowerCase().includes(k))));
      const currentOffset = offsets.three;
      const matches = allMatches.slice(currentOffset, currentOffset + 3);
      
      let html = `Here are some of Vimal's <strong>3D & Creative Web Projects</strong> (Showing ${currentOffset + 1}-${Math.min(currentOffset + 3, allMatches.length)} of ${allMatches.length}):<br/><br/>`;
      matches.forEach(m => {
        html += `• <strong>${m.name}</strong>: <a href="${m.html_url}" target="_blank" style="color:var(--accent); text-decoration:underline;">[View on GitHub]</a><br/>`;
      });

      const hasMore = currentOffset + 3 < allMatches.length;
      if (hasMore) setOffsets(prev => ({ ...prev, three: prev.three + 3 }));

      return { 
        content: matches.length > 0 ? html : "I couldn't find specific 3D repos at the moment.", 
        chips: hasMore ? ["More 3D Web Projects", "AI Projects", "Live Products"] : ["AI Projects", "Full Stack Projects", "Live Products"] 
      };
    }

    if (lower.match(/(project|app|portfolio|build|built|made)/)) {
      return {
        content: `Vimal has over ${profile.githubRepoCount} projects across multiple domains including AI, Data Science, Full Stack Web, and 3D Experiences!<br/><br/>Which category would you like to explore?`,
        chips: ["AI Projects", "Data Science Projects", "Full Stack Projects", "3D Web Projects", "Live Products"]
      };
    } 
    
    if (lower.match(/(skill|tech|stack|know|language|framework|tool)/)) {
      return {
        content: `Vimal specializes in <strong>AI Integrations & Full-Stack Web Dev</strong>. His main stack includes: <strong>${profile.aboutTools.join(', ')}</strong>. He also uses Three.js and GSAP for creative frontends.`,
        chips: ["Tell me about your projects", "Show me your GitHub"]
      };
    } 
    
    if (lower.match(/(github|repo|code|open source)/)) {
      return {
        content: `Vimal is very active in open source with over <strong>${profile.githubRepoCount} repositories</strong>! <br/>You can explore his projects, AI tools, and scripts right here: <br/><a href="${profile.githubUrl}" target="_blank" style="color:var(--accent); text-decoration:underline;">[Visit Vimal's GitHub]</a>`,
        chips: ["Tell me about your projects", "What are your skills?"]
      };
    }

    if (lower.match(/(who are you|agent|bot|ai)/)) {
      return {
        content: "I'm a smart keyword-based agent built directly into this portfolio! I'm designed to help you quickly navigate Vimal's work. What type of projects are you looking for?",
        chips: ["AI Projects", "Data Science Projects", "Full Stack Projects", "3D Web Projects"]
      };
    }

    if (lower.match(/(hi|hello|hey|greetings)/)) {
      return {
        content: "Hello! How can I help you today? You can ask me about Vimal's skills, projects, or how to contact him.",
        chips: INITIAL_SUGGESTIONS
      };
    }

    // Try to find a matching Github repo based on words in the query
    if (repos.length > 0) {
      // Split by space or hyphen, remove non-alphanumeric, and allow >= 3 chars (e.g. RAG, API, LLM)
      const words = lower.replace(/[^a-z0-9\s-]/g, ' ').split(/[\s-]+/).filter(w => w.length >= 3);
      
      // Filter out generic words that might cause false positives
      const ignoreWords = ['project', 'about', 'build', 'what', 'repo', 'github'];
      const searchWords = words.filter(w => !ignoreWords.includes(w));

      for (const word of searchWords) {
        const match = repos.find(r => r.name.toLowerCase().includes(word) || (r.description && r.description.toLowerCase().includes(word)));
        if (match) {
          return {
            content: `It looks like you're asking about one of Vimal's GitHub projects: <strong>${match.name}</strong>!<br/><br/>${match.description ? `Description: ${match.description}<br/><br/>` : ''}<a href="${match.html_url}" target="_blank" style="color:var(--accent); text-decoration:underline;">[View Repository on GitHub]</a>`,
            chips: ["Show me other projects", "What are your skills?"]
          };
        }
      }
    }

    return {
      content: "That's interesting! I'm programmed to talk about Vimal's skills, projects, and availability. You can also name a specific project or tech you're looking for, and I'll check his GitHub!",
      chips: INITIAL_SUGGESTIONS
    };
  };

  const handleSend = (textOverride?: string) => {
    const textToProcess = textOverride || input;
    if (!textToProcess.trim() || isTyping) return;

    const userMessage = textToProcess.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    if (!textOverride) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const reply = generateResponse(userMessage);
      setMessages(prev => [...prev, { role: 'agent', content: reply.content, chips: reply.chips }]);
      setIsTyping(false);
    }, 800);
  };

  const handleReset = () => {
    setMessages([initialMessage]);
    setInput('');
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/919336058326?text=Hi%20Vimal,%20I'm%20interested%20in%20working%20with%20you`, '_blank');
  };

  const handleEmail = () => {
    window.location.href = `mailto:${profile.email}?subject=Freelance Inquiry`;
  };

  return (
    <>
      <button 
        className={`${styles.fab} ${isOpen ? styles.fabHidden : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open AI Assistant"
      >
        <Sparkles size={24} />
      </button>

      <div className={`${styles.chatWindow} ${isOpen ? styles.chatOpen : ''}`}>
        <div className={styles.chatHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.avatar}>
              <Bot size={20} />
            </div>
            <div>
              <div className={styles.chatTitle}>Whizz-Assistance</div>
              <div className={styles.chatSubtitle}>Local Keyword Assistant</div>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.iconBtn} onClick={handleReset} aria-label="Reset chat" title="Reset Chat">
              <RotateCcw size={18} />
            </button>
            <button className={styles.iconBtn} onClick={() => setIsOpen(false)} aria-label="Close chat">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className={styles.chatBody} data-lenis-prevent>
          {messages.map((msg, i) => (
            <div key={i} className={styles.messageBlock}>
              <div className={`${styles.messageWrapper} ${msg.role === 'user' ? styles.messageUser : styles.messageAgent}`}>
                <div 
                  className={styles.messageBubble}
                  dangerouslySetInnerHTML={{ __html: msg.content }}
                />
              </div>
              {/* Dynamic suggestion chips for this specific agent message */}
              {msg.role === 'agent' && msg.chips && i === messages.length - 1 && !isTyping && (
                <div className={styles.dynamicChips}>
                  {msg.chips.map((chip, idx) => (
                    <button key={idx} className={styles.suggestionChip} onClick={() => handleSend(chip)}>
                      {chip} <ChevronRight size={14} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className={`${styles.messageWrapper} ${styles.messageAgent}`}>
              <div className={styles.messageBubble}>
                <div className={styles.typingDots}>
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Initial Suggestion Chips if no messages yet */}
        {messages.length < 2 && !isTyping && (
          <div className={styles.suggestionList}>
            {INITIAL_SUGGESTIONS.map((sug, i) => (
              <button key={i} className={styles.suggestionChip} onClick={() => handleSend(sug)}>
                {sug} <ChevronRight size={14} />
              </button>
            ))}
          </div>
        )}

        <div className={styles.quickActions}>
          <button className={styles.actionBtn} onClick={handleWhatsApp}>
            <Phone size={14} /> WhatsApp
          </button>
          <button className={styles.actionBtn} onClick={handleEmail}>
            <Mail size={14} /> Email
          </button>
        </div>

        <div className={styles.chatInputWrapper}>
          <input 
            type="text" 
            className={styles.chatInput} 
            placeholder="Ask about my projects..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className={styles.sendBtn} onClick={() => handleSend()}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </>
  );
}
