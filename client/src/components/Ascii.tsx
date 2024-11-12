const nameWide = `   ______           __                   __ __     ____                 
  /___  /___  _____/ /_  __  ______ _   / //_/__  / / /___  ____ _____ _
 __  / / __ \\/ ___/ __ \\/ / / / __ \`/  / ,< / _ \\/ / / __ \\/ __ \`/ __ \`/
/ /_/ / /_/ (__  ) / / / /_/ / /_/ /  / /| /  __/ / / /_/ / /_/ / /_/ / 
\\____/\\____/____/_/ /_/\\__,_/\\__,_/  /_/ |_\\___/_/_/\\____/\\__, /\\__, /  
                           full-stack software developer /____//____/   `;

const nameStack = `   ______           __               
  /___  /___  _____/ /_  __  ______ _
 __  / / __ \\/ ___/ __ \\/ / / / __ \`/
/ /_/ / /_/ (__  ) / / / /_/ / /_/ / 
\\____/\\____/____/_/ /_/\\__,_/\\__,_/  
     full-stack software developer   
    / //_/__  / / /___  ____ _____ _ 
   / ,< / _ \\/ / / __ \\/ __ \`/ __ \`/ 
  / /| /  __/ / / /_/ / /_/ / /_/ /  
 /_/ |_\\___/_/_/\\____/\\__, /\\__, /   
                     /____//____/    `;

export function AsciiNameBanner({
    className = "",
    variant,
}: {
    className?: string;
    variant: "wide" | "stacked";
}) {
    return (
        <div className={className}>
            <pre
                className="w-fit text-sm font-bold"
                aria-description="ascii art banner of the name 'Joshua Kellogg' with a subtitle of 'full-stack software engineer'"
            >
                {variant === "wide" ? nameWide : nameStack}
            </pre>
        </div>
    );
}

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

export function FakeNeoFetch() {
    const user = "josh";
    const host = "jkellogg.dev";

    const stats = [
        { k: "OS", v: "Arch Linux x86_64" },
        { k: "Kernel", v: "6.10.10-arch1-1" },
        { k: "Uptime", v: "8 days, 15 hours, 11 mins" },
        { k: "Packages", v: "663 (pacman)" },
        { k: "Shell", v: "bash 5.2.32" },
        { k: "Resolution", v: "2560x1440" },
        { k: "WM", v: "sway" },
        { k: "Theme", v: "tokyonight" },
        { k: "Terminal", v: "Alacritty" },
    ];

    return (
        <div className="flex flex-row">
            <pre
                aria-description="ascii art of the logo for Arch Linux"
                className="text-tokyonight-cyan font-bold max-xl:hidden text-xs"
            >
                {arch}
            </pre>
            <div className="w-4 max-xl:hidden" />
            <div className="font-mono text-sm">
                <span className="text-tokyonight-cyan font-bold">{user}</span>@
                <span className="text-tokyonight-cyan font-bold">{host}</span>
                <br />
                {new String().padStart(user.length + host.length + 1, "-")}
                <br />
                {stats.map(({ k, v }) => (
                    <div key={k + v}>
                        <span className="text-tokyonight-cyan font-bold">{k}</span>: {v}
                    </div>
                ))}
            </div>
        </div>
    );
}
