import { Card } from "./components/Card";
import { TopArtists } from "./components/TopArtists";

export default function () {
	return (
		<div className="container mx-auto my-8 grid grid-cols-5 gap-4">
			<div className="flex flex-col gap-4">
				<Card>
					<h2 className="font-bold text-lg text-tokyonight-magenta text-end">
						Joshua Kellogg
					</h2>
					<h1 className="font-semibold text-sm text-end">
						Full-Stack Software Engineer
					</h1>
				</Card>
				<Card>
					<p>
						this will probably be replaced by the contribution graph when/if
						that is ever possible to implement correctly
					</p>
				</Card>
			</div>
			<div className="flex flex-col gap-4 col-span-2">
				<Card>
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
						dapibus. Suspendisse eu sodales quam, ac rutrum magna. Suspendisse
						fermentum, nunc at commodo dignissim, nibh sapien vulputate augue,
						sed molestie nisl mi in lorem. Vivamus sagittis quam viverra diam
						sagittis, ut lobortis nulla ornare. Fusce nec facilisis erat.
						Quisque at mauris sem. Sed leo odio, scelerisque vel nisi at,
						faucibus imperdiet diam. Vestibulum ut posuere velit. Sed a purus
						turpis. Phasellus metus dolor, laoreet vel aliquam eget, placerat
						non nunc. Praesent risus ipsum, sagittis vel interdum aliquam,
						tincidunt sit amet tortor. Nulla vel lectus ut turpis sagittis
						placerat nec vel libero. Aenean blandit ut dolor non commodo. Nullam
						volutpat ut lorem non semper. Nulla imperdiet euismod dolor
						ultricies pharetra. Nam mollis, ex eget porta fermentum, ante sem
						gravida massa, ac luctus eros lectus condimentum dui. Aenean porta
						aliquam sem. Sed at purus interdum, faucibus purus in, dignissim
						est. Ut turpis lectus, tempus nec sodales vel, facilisis in quam.
						Vestibulum ac finibus massa. Vestibulum eu ipsum eu turpis tempus
						dapibus. Aenean nec neque facilisis, consectetur justo vitae,
						viverra erat.
					</p>
				</Card>
			</div>
			<div className="col-span-2">
				<Card>
					<TopArtists limit={5} offset={0} time_range="medium_term" />
				</Card>
			</div>
		</div>
	);
}
