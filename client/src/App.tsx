import { ContactForm } from "./components/ContactForm";
import { TopArtists } from "./components/TopArtists";

// these seem redundant but formatters do not respect the contents of <pre> tags. Who knows why? Certainly not me

const figFirstName = `   ______           __               
  /___  /___  _____/ /_  __  ______ _
 __  / / __ \\/ ___/ __ \\/ / / / __ \`/
/ /_/ / /_/ (__  ) / / / /_/ / /_/ / 
\\____/\\____/____/_/ /_/\\__,_/\\__,_/  
                                     `;

const figLastName = `    __ __     ____                 
   / //_/__  / / /___  ____ _____ _
  / ,< / _ \\/ / / __ \\/ __ \`/ __ \`/
 / /| /  __/ / / /_/ / /_/ / /_/ / 
/_/ |_\\___/_/_/\\____/\\__, /\\__, /  
                    /____//____/   
`;

const arch = `                  -\`
                 .o+\`
                \`ooo/
               \`+oooo:
              \`+oooooo:
              -+oooooo+:
            \`/:-:++oooo+:
           \`/++++/+++++++:
          \`/++++++++++++++:
         \`/+++ooooooooooooo/\`
        ./ooosssso++osssssso+\`
       .oossssso-\`\`\`\`/ossssss+\`
      -osssssso.      :ssssssso.
     :osssssss/        osssso+++.
    /ossssssss/        +ssssooo/-
  \`/ossssso+/:-        -:/+osssso+-
 \`+sso+:-\`                 \`.-/+oso:
\`++:.                           \`-/+/
.\`                                 \`/`;

const fetchResult = `josh@https://www.jkellogg.dev
-----------------------------
OS: Arch Linux x86_64
Kernel: 6.10.10-arch1-1
Uptime: 8 days, 15 hours, 11 mins
Packages: 663 (pacman)
Shell: bash 5.2.32
Resolution: 2560x1440
WM: sway
Theme: tokyonight
Terminal: alacritty`;

export function App() {
  return (
    <div className="container mx-auto my-8 flex flex-row flex-wrap md:flex-nowrap gap-4 justify-center items-start">
      <div className="flex flex-col gap-4 w-full md:w-96 xl:w-[38rem]">
        <div className="text-tokyonight-magenta bg-tokyonight-background-dark p-4 rounded-lg flex flex-col sm:flex-row md:flex-col xl:flex-row justify-center items-center gap-0 border border-tokyonight-foreground">
          <pre
            className="w-fit text-xs"
            aria-label="Joshua"
            aria-description="ascii art of my first name, Joshua"
          >
            {figFirstName}
          </pre>
          <pre
            className="w-fit text-xs"
            aria-label="Kellogg"
            aria-description="ascii art of my last name, Kellogg"
          >
            {figLastName}
          </pre>
        </div>
        <div className="justify-center bg-tokyonight-background-dark p-4 rounded-lg hidden md:flex flex-row gap-0 border border-tokyonight-foreground">
          <pre
            className="w-fit text-xs hidden xl:block text-tokyonight-cyan"
            aria-description="ascii art of the Arch Linux logo"
          >
            {arch}
          </pre>
          <div className="w-[1ch] hidden xl:block" />
          {/* I don't think this needs aria-description because it's actually textual */}
          <pre className="w-fit text-xs">{fetchResult}</pre>
        </div>
        <div className="bg-tokyonight-background-dark border border-tokyonight-foreground rounded-lg p-4 hidden md:block">
          <TopArtists limit={5} offset={0} time_range="short_term" />
        </div>
      </div>
      <div className="flex flex-col gap-4 max-w-prose">
        <div className="bg-tokyonight-background-dark p-4 rounded-lg border border-tokyonight-foreground">
          <h3 className="text-xl font-bold text-tokyonight-blue">About Me</h3>
          <p>
            My name is Joshua Kellogg and I'm a full-stack software engingeer.
            I've been doing full-stack web development since I graduated from
            the University of Denver's Full-Stack Flex boot camp. I love to
            explore areas of computer science outside of web development (most
            recently{" "}
            <a
              className="underline text-tokyonight-blue"
              href="https://pages.cs.wisc.edu/~remzi/OSTEP/"
              target="_blank"
            >
              operating systems
            </a>
            ). I also really love:
          </p>
          <ul className="list-disc list-inside leading-loose">
            <li>
              Ricing{" "}
              <a
                href="https://stallman-copypasta.github.io/"
                target="_blank"
                className="text-tokyonight-magenta-bright cursor-pointer"
              >
                Linux
              </a>
            </li>
            <li>Riding my bike</li>
            <li>Hanging out with my dog</li>
            <li>Playing guitar</li>
          </ul>
          <p>
            I'm currently seeking out full-time software engineering roles, so
            if you're looking to add a passionate, dynamic, and highly-motivated
            junior engineer to your team, don't hesitate to reach out!
          </p>
        </div>
        <div className="border border-tokyonight-foreground bg-tokyonight-background-dark p-4 rounded-lg flex flex-col gap-2">
          <details className="bg-tokyonight-green/5 p-2 rounded-md border border-tokyonight-green/50">
            <summary className="text-xl font-bold text-tokyonight-green cursor-pointer">
              Language Proficiencies
            </summary>
            <p>
              I have a high level of comfort in both Go and Javascript, with
              additional experience writing C, Python, and Java.
            </p>
            <p>
              I also posess a strong grasp of essential domain-specific
              languages for the web, including HTML, CSS, and SQL.
            </p>
          </details>
          <details className="bg-tokyonight-magenta/5 p-2 rounded-md border border-tokyonight-magenta/50">
            <summary className="text-xl font-bold text-tokyonight-magenta cursor-pointer">
              Framework Proficiencies
            </summary>
            <p>
              On the front end I have worked mainly using React, although I also
              have experience using alternative client reactivity libraries such
              as jQuery and HTMX in conjunction with server-side templating
              engines such as Handlebars.
            </p>
            <p>
              Most of my current backend work is in Go without using any
              frameworks, but in the past I have used Express and Hono from the
              Javascript ecosystem as well.
            </p>
          </details>
          <details className="bg-tokyonight-blue/5 p-2 rounded-md border border-tokyonight-blue/50">
            <summary className="text-xl font-bold text-tokyonight-blue cursor-pointer">
              Technology Proficiencies
            </summary>
            {/* there may be a better name for this section */}
            <p>
              I have worked with a variety of relational and noSQL databases,
              including MySQL, PostgresQL, and MongoDB. My preferred database
              interaction layer of late has been using SQLc to compile SQL
              queries into type-safe, reusable functions, but I have also worked
              with ORMs such as Drizzle and Sequelize.
            </p>
            <p>
              I also have experience with DevOps technologies such as Docker &
              Docker Compose, and use them for managing both my personal
              development environment and my ongoing deployments on a regular
              basis.
            </p>
          </details>
        </div>
        <div className="border border-tokyonight-foreground bg-tokyonight-background-dark p-4 rounded-lg">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
