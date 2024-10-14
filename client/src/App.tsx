import { TopArtists } from "./components/TopArtists";

// these seem redundant but formatters do not respect the contents of <pre> tags. Who knows why? Certainly not me

const figFirstName = `       __           __               
      / /___  _____/ /_  __  ______ _
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
Terminal: alacritty
CPU: AMD Ryzen 7 7700X (16) @ 5.573GHz
GPU: AMD ATI 0e:00.0 Raphael
GPU: AMD ATI Radeon RX 6600/6600 XT/6600M
Memory: 6433MiB / 31233MiB`;

export default function () {
  return (
    <div className="container mx-auto my-8 flex flex-row flex-wrap md:flex-nowrap gap-4 justify-center items-start">
      <div className="flex flex-col gap-4 w-full md:w-96 xl:w-[38rem]">
        <div className="text-tokyonight-green bg-tokyonight-background-dark p-4 rounded-lg flex flex-col sm:flex-row md:flex-col xl:flex-row justify-center items-center gap-0 border border-tokyonight-foreground">
          <pre className="w-fit text-xs">{figFirstName}</pre>
          <pre className="w-fit text-xs">{figLastName}</pre>
        </div>
        <div className="justify-center bg-tokyonight-background-dark p-4 rounded-lg hidden md:flex flex-row gap-0 border border-tokyonight-foreground">
          <pre className="w-fit text-xs hidden xl:block text-tokyonight-cyan">
            {arch}
          </pre>
          <div className="w-[1ch] hidden xl:block" />
          <pre className="w-fit text-xs text-tokyonight-blue">
            {fetchResult}
          </pre>
        </div>
        <div className="bg-tokyonight-background-dark border border-tokyonight-foreground rounded-lg p-4 hidden md:block">
          <TopArtists limit={5} offset={0} time_range="medium_term" />
        </div>
      </div>
      <div className="flex flex-col gap-4 max-w-prose">
        <div className="bg-tokyonight-background-dark p-4 rounded-lg border border-tokyonight-foreground">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            vel gravida purus. Aenean luctus mauris eu cursus vulputate.
            Vestibulum pulvinar orci a elit eleifend, in efficitur dui commodo.
            Suspendisse nec feugiat sapien. Donec tortor mauris, tincidunt vel
            consectetur vel, ultricies vitae metus. Praesent tempor massa quis
            turpis elementum, ac dictum lectus tempor. Donec eu hendrerit sem.
            Integer vitae tortor in ligula ultrices eleifend vel id ante.
            Interdum et malesuada fames ac ante ipsum primis in faucibus. Donec
            et porttitor metus. Aliquam tempor sollicitudin libero, ornare
            vulputate enim dapibus ac. Maecenas risus eros, dictum ut turpis
            vitae, venenatis posuere nunc. Suspendisse mauris magna, condimentum
            ut aliquam ac, pharetra tempor justo. Aliquam eget aliquam quam, sed
            tristique diam. Ut lobortis dapibus pharetra. Nulla pulvinar
            venenatis congue. Vestibulum ante ipsum primis in faucibus orci
            luctus et ultrices posuere cubilia curae; Quisque nisi velit, mollis
            eu magna quis, dictum posuere mi. Morbi dignissim orci ac eros
            pulvinar, ac porta est hendrerit. Vestibulum ante ipsum primis in
            faucibus orci luctus et ultrices posuere cubilia curae; Morbi luctus
            non ex sed lobortis. Class aptent taciti sociosqu ad litora torquent
            per conubia nostra, per inceptos himenaeos. Nullam elit nibh,
            sollicitudin efficitur orci et, placerat ultrices magna. Nunc
            venenatis elementum porttitor. Mauris arcu massa, laoreet ut justo
            sit amet, ultricies consequat lorem. Donec laoreet commodo diam ac
            aliquam. Cras at semper magna. Praesent commodo metus quis aliquam
            dapibus.
          </p>
        </div>
      </div>
    </div>
  );
}
