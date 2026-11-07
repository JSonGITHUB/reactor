import React, { useEffect, useMemo, useRef, useState } from 'react';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import icons from '../site/icons';

const STORE_INFO = {
	name: 'Encinitas Home Depot',
	address: '100 Encinitas Blvd, Encinitas, CA',
	focus: 'Offline lumber and building materials finder for aisles 21 through 31 with editable local catalog',
};

const THD_PRODUCTS_STORAGE_KEY = 'thdOfflineProducts';

const DEFAULT_PRODUCT_FORM = {
	sku: '',
	name: '',
	category: '',
	materialType: '',
	size: '',
	aisle: '',
	bay: '',
	unit: '',
	price: '$',
	uses: '',
	notes: '',
};


const PRICE_BANDS = ['$', '$$', '$$$', '$$$$'];

const makeVariant = (label, size, price, notes) => ({
	label,
	size,
	price,
	notes,
});

const buildSeedProducts = (aisleNumber, category, families) => families.flatMap((family) => (
	family.variants.map((variant, variantIndex) => ({
		id: `thd-a${aisleNumber}-${family.slug}-${variantIndex + 1}`,
		sku: `${family.skuPrefix}-${aisleNumber}-${String(variantIndex + 1).padStart(2, '0')}`,
		name: `${variant.label} ${family.name}`,
		category,
		materialType: family.materialType,
		size: variant.size,
		aisle: `Aisle ${aisleNumber}`,
		bay: `Bay ${String(family.bayStart + variantIndex).padStart(2, '0')}`,
		unit: family.unit,
		price: variant.price,
		uses: family.uses,
		notes: variant.notes,
	}))
));

const AISLE_TEMPLATE = {
	21: {
		category: 'Concrete & Masonry',
		families: [
			{ slug: 'rebar', skuPrefix: 'MAS-REB', name: 'Rebar', materialType: 'Rebar', unit: 'each', bayStart: 1, uses: ['slabs', 'footings', 'concrete reinforcement'], variants: [makeVariant('#3 10 ft', '#3 x 10 ft', '$', 'Common reinforcing bar for small concrete work.'), makeVariant('#4 20 ft', '#4 x 20 ft', '$$', 'Long reinforcing bar for larger pours.'), makeVariant('#5 20 ft', '#5 x 20 ft', '$$$', 'Heavier bar for demanding structural pours.'), makeVariant('#6 20 ft', '#6 x 20 ft', '$$$$', 'Large bar for robust reinforcement needs.')] },
			{ slug: 'mesh', skuPrefix: 'MAS-MSH', name: 'Wire Mesh Sheet', materialType: 'Wire Mesh', unit: 'sheet', bayStart: 5, uses: ['slabs', 'walkways', 'patio pours'], variants: [makeVariant('6 x 6', '5 ft x 10 ft sheet', '$$', 'Mesh sheet for reinforcing flatwork.'), makeVariant('4 x 4', '5 ft x 10 ft sheet', '$$', 'Tighter mesh pattern for lighter pours.'), makeVariant('Remesh', '5 ft x 10 ft sheet', '$$$', 'Heavier mesh for durable slabs.'), makeVariant('Roll Mesh', '5 ft x 50 ft roll', '$$$$', 'Bulk mesh for bigger concrete jobs.')] },
			{ slug: 'mixing', skuPrefix: 'MAS-MIX', name: 'Mixing Tool', materialType: 'Concrete Tool', unit: 'each', bayStart: 9, uses: ['mixing', 'cleanup', 'masonry prep'], variants: [makeVariant('Tub', '24 gal', '$', 'Reusable tub for small batch mixing.'), makeVariant('Hoe', 'standard', '$', 'Mixing hoe for mortar and concrete.'), makeVariant('Hoe and Tub Set', 'set', '$$', 'Starter set for mixing on site.'), makeVariant('Wheelbarrow', '6 cu ft', '$$$', 'Transport and mixing helper.')] },
			{ slug: 'masonry-tools', skuPrefix: 'MAS-TOL', name: 'Masonry Tool', materialType: 'Hand Tool', unit: 'each', bayStart: 13, uses: ['demolition', 'brick cleanup', 'stone work'], variants: [makeVariant('Chisel', '12 in.', '$', 'Tool for trimming and breaking masonry.'), makeVariant('Trowel', '11 in.', '$', 'Hand tool for spreading mortar.'), makeVariant('Jointer', 'standard', '$', 'Tool for shaping mortar joints.'), makeVariant('Brick Hammer', '16 oz', '$$', 'Hammer and chisel combo for masonry work.')] },
			{ slug: 'adhesive', skuPrefix: 'MAS-ADH', name: 'Concrete Bonding Adhesive', materialType: 'Bonding Agent', unit: 'qt', bayStart: 17, uses: ['patching', 'repair', 'overlays'], variants: [makeVariant('1 qt', '1 qt', '$', 'Small bottle for repair prep.'), makeVariant('1 gal', '1 gal', '$$', 'Common can for larger patch work.'), makeVariant('2 gal', '2 gal', '$$$', 'Bulk can for repeated use.'), makeVariant('5 gal', '5 gal', '$$$$', 'Contractor pail for big repairs.')] },
		],
	},
	22: {
		category: 'Insulation',
		families: [
			{ slug: 'fiberglass', skuPrefix: 'INS-FBG', name: 'Fiberglass Batt', materialType: 'Fiberglass', unit: 'bundle', bayStart: 1, uses: ['wall cavities', 'garage walls', 'ceilings'], variants: [makeVariant('R-13', '15 in. x 93 in.', '$$', 'Standard 2x4 wall insulation.'), makeVariant('R-19', '23 in. x 93 in.', '$$', 'Common batt for wider cavities.'), makeVariant('R-21', '15 in. x 93 in.', '$$$', 'Higher-R option for tighter walls.'), makeVariant('R-30', '24 in. x 48 in.', '$$$', 'Thicker batt for better thermal control.')] },
			{ slug: 'mineral-wool', skuPrefix: 'INS-MWL', name: 'Mineral Wool Batt', materialType: 'Mineral Wool', unit: 'bundle', bayStart: 5, uses: ['sound control', 'fire blocking', 'interior walls'], variants: [makeVariant('Fire + Sound', '15 in. x 47 in.', '$$$', 'Dense batt for acoustic and fire applications.'), makeVariant('Comfort', '16 in. x 48 in.', '$$$', 'Flexible batt for general retrofit work.'), makeVariant('Pro', '24 in. x 48 in.', '$$$', 'Higher coverage batt for larger cavities.'), makeVariant('Ultra', '24 in. x 60 in.', '$$$$', 'Thicker performance batt for premium installs.')] },
			{ slug: 'foam-board', skuPrefix: 'INS-FBM', name: 'Foam Board Insulation', materialType: 'Rigid Foam', unit: 'sheet', bayStart: 9, uses: ['sheathing', 'basements', 'thermal breaks'], variants: [makeVariant('1/2 in.', '4 ft x 8 ft', '$$', 'Thin insulation board for simple thermal breaks.'), makeVariant('3/4 in.', '4 ft x 8 ft', '$$', 'Mid-thickness board for wall and rim joists.'), makeVariant('1 in.', '4 ft x 8 ft', '$$$', 'Standard rigid board for many retrofit projects.'), makeVariant('2 in.', '4 ft x 8 ft', '$$$$', 'Thicker board for higher R-value needs.')] },
			{ slug: 'radiant-barrier', skuPrefix: 'INS-RAD', name: 'Radiant Barrier', materialType: 'Reflective Barrier', unit: 'roll', bayStart: 13, uses: ['attics', 'roof decks', 'heat reflection'], variants: [makeVariant('100 sq ft', '100 sq ft roll', '$$', 'Compact roll for small attic jobs.'), makeVariant('250 sq ft', '250 sq ft roll', '$$', 'Medium roll for common attic coverage.'), makeVariant('500 sq ft', '500 sq ft roll', '$$$', 'Large roll for broader coverage.'), makeVariant('1000 sq ft', '1000 sq ft roll', '$$$$', 'Bulk roll for large retrofit projects.')] },
			{ slug: 'air-seal', skuPrefix: 'INS-AIR', name: 'Air Sealant', materialType: 'Sealant', unit: 'tube', bayStart: 17, uses: ['gaps', 'penetrations', 'draft control'], variants: [makeVariant('Spray Foam', '12 oz can', '$', 'Expanding foam for irregular gaps.'), makeVariant('Acoustic Caulk', '28 oz tube', '$$', 'Sealant for sound and draft control.'), makeVariant('Weather Seal', '10 oz tube', '$', 'Sealant for smaller air leaks.'), makeVariant('Backer Rod', '20 ft', '$', 'Foam rod for larger sealant joints.')] },
		],
	},
	23: {
		category: 'Framing & Sheathing',
		families: [
			{ slug: 'spf-studs', skuPrefix: 'LMB-SPF', name: 'SPF Stud', materialType: 'SPF', unit: 'each', bayStart: 1, uses: ['interior walls', 'framing', 'blocking'], variants: [makeVariant('2 x 4 x 8', '2 x 4 x 8 ft', '$', 'Standard stud for interior framing.'), makeVariant('2 x 4 x 10', '2 x 4 x 10 ft', '$', 'Longer stud for taller walls.'), makeVariant('2 x 4 x 12', '2 x 4 x 12 ft', '$$', 'Extended stud for utility framing.'), makeVariant('2 x 4 x 16', '2 x 4 x 16 ft', '$$', 'Long stud for larger wall runs.')] },
			{ slug: 'pt-lumber', skuPrefix: 'LMB-PT', name: 'Pressure Treated Lumber', materialType: 'Pressure Treated', unit: 'each', bayStart: 5, uses: ['deck framing', 'stairs', 'outdoor structures'], variants: [makeVariant('2 x 4', '2 x 4 x 8 ft', '$$', 'Small PT board for outdoor framing.'), makeVariant('2 x 6', '2 x 6 x 8 ft', '$$', 'Common PT board for deck work.'), makeVariant('2 x 8', '2 x 8 x 8 ft', '$$$', 'Heavier PT board for deck joists.'), makeVariant('4 x 4', '4 x 4 x 8 ft', '$$$', 'Popular PT post size for exterior builds.')] },
			{ slug: 'douglas-fir', skuPrefix: 'LMB-DF', name: 'Douglas Fir Board', materialType: 'Douglas Fir', unit: 'each', bayStart: 9, uses: ['joists', 'rafters', 'beams'], variants: [makeVariant('2 x 6', '2 x 6 x 8 ft', '$$', 'Common framing member for span work.'), makeVariant('2 x 8', '2 x 8 x 8 ft', '$$$', 'Heavier board for joists and rafters.'), makeVariant('2 x 10', '2 x 10 x 10 ft', '$$$', 'Longer board for wider spans.'), makeVariant('2 x 12', '2 x 12 x 12 ft', '$$$$', 'Large board for heavy structural work.')] },
			{ slug: 'lvl-beam', skuPrefix: 'LMB-LVL', name: 'LVL Beam', materialType: 'Engineered Lumber', unit: 'each', bayStart: 13, uses: ['headers', 'beams', 'load bearing spans'], variants: [makeVariant('1.75 x 9.25', '1.75 x 9.25 x 12 ft', '$$$$', 'Slim engineered beam for headers.'), makeVariant('1.75 x 11.875', '1.75 x 11.875 x 12 ft', '$$$$', 'Common beam size for medium spans.'), makeVariant('1.75 x 14', '1.75 x 14 x 16 ft', '$$$$', 'Larger beam for stronger load paths.'), makeVariant('1.75 x 16', '1.75 x 16 x 20 ft', '$$$$$', 'Big beam for major load-bearing work.')] },
			{ slug: 'furring-strip', skuPrefix: 'LMB-FUR', name: 'Furring Strip', materialType: 'Furring', unit: 'each', bayStart: 17, uses: ['wall spacing', 'trim out', 'leveling'], variants: [makeVariant('1 x 2 x 8', '1 x 2 x 8 ft', '$', 'Lightweight strip for adjustments and spacers.'), makeVariant('1 x 3 x 8', '1 x 3 x 8 ft', '$', 'Thin spacer for interior work.'), makeVariant('1 x 4 x 8', '1 x 4 x 8 ft', '$', 'Common strip for trim and spacing.'), makeVariant('1 x 6 x 8', '1 x 6 x 8 ft', '$$', 'Wider strip for more surface area.')] },
		],
	},
	24: {
		category: 'Hardware & Connectors',
		families: [
			{ slug: 'joist-hangers', skuPrefix: 'HDW-HGR', name: 'Joist Hanger', materialType: 'Connector', unit: 'each', bayStart: 1, uses: ['deck joists', 'ledger connections', 'framing repairs'], variants: [makeVariant('2 x 4', '2 x 4', '$', 'Small hanger for compact framing members.'), makeVariant('2 x 6', '2 x 6', '$', 'Common hanger for standard framing.'), makeVariant('2 x 8', '2 x 8', '$$', 'Heavier hanger for deck and stair framing.'), makeVariant('2 x 10', '2 x 10', '$$', 'Large hanger for bigger joists.')] },
			{ slug: 'strap-ties', skuPrefix: 'HDW-STR', name: 'Strap Tie', materialType: 'Strap Connector', unit: 'each', bayStart: 5, uses: ['hurricane ties', 'blocking', 'repair work'], variants: [makeVariant('12 in.', '12 in.', '$', 'Short strap for light-duty bracing.'), makeVariant('18 in.', '18 in.', '$', 'Popular strap for framing reinforcement.'), makeVariant('24 in.', '24 in.', '$', 'Longer tie for stronger connections.'), makeVariant('36 in.', '36 in.', '$$', 'Extended tie for larger spans.')] },
			{ slug: 'angle-connectors', skuPrefix: 'HDW-ANG', name: 'Angle Connector', materialType: 'Connector', unit: 'each', bayStart: 9, uses: ['corner reinforcement', 'blocking', 'misc framing'], variants: [makeVariant('90 degree', '90 degree angle', '$', 'Basic right-angle connector.'), makeVariant('Flat brace', 'flat brace', '$', 'Simple brace for surface reinforcement.'), makeVariant('Corner brace', 'corner brace', '$', 'Useful for cabinet and trim support.'), makeVariant('Mending plate', 'mending plate', '$', 'Reinforces cracked or split lumber.')] },
			{ slug: 'post-caps', skuPrefix: 'HDW-CAP', name: 'Post Cap', materialType: 'Post Cap', unit: 'each', bayStart: 13, uses: ['fence posts', 'deck posts', 'decorative finishing'], variants: [makeVariant('4 x 4', '4 x 4', '$', 'Cap for standard post tops.'), makeVariant('6 x 6', '6 x 6', '$$', 'Cap for larger posts and columns.'), makeVariant('Decorative', 'decorative', '$$', 'Styled cap for visible wood posts.'), makeVariant('Solar', 'solar', '$$$', 'Lighted cap for exterior posts.')] },
			{ slug: 'mending-plates', skuPrefix: 'HDW-MPL', name: 'Mending Plate', materialType: 'Plate', unit: 'each', bayStart: 17, uses: ['cracks', 'joints', 'repairs'], variants: [makeVariant('4 in.', '4 in.', '$', 'Small plate for quick repairs.'), makeVariant('6 in.', '6 in.', '$', 'Common plate for joints and patches.'), makeVariant('8 in.', '8 in.', '$', 'Larger plate for stronger joints.'), makeVariant('12 in.', '12 in.', '$$', 'Large plate for heavier repairs.')] },
		],
	},
	25: {
		category: 'Fasteners',
		families: [
			{ slug: 'deck-screws', skuPrefix: 'FST-DSC', name: 'Deck Screws', materialType: 'Exterior Screws', unit: 'box', bayStart: 1, uses: ['deck boards', 'outdoor framing', 'fences'], variants: [makeVariant('1 lb', '1 lb box', '$', 'Small box for quick repairs.'), makeVariant('5 lb', '5 lb box', '$$', 'Popular jobsite box for outdoor builds.'), makeVariant('10 lb', '10 lb box', '$$', 'Larger box for repeat deck work.'), makeVariant('25 lb', '25 lb box', '$$$', 'Bulk box for larger contractor jobs.')] },
			{ slug: 'framing-nails', skuPrefix: 'FST-FRM', name: 'Framing Nails', materialType: 'Framing Nails', unit: 'box', bayStart: 5, uses: ['wall framing', 'studs', 'general framing'], variants: [makeVariant('1 lb', '1 lb box', '$', 'Small box for trim and touch-up work.'), makeVariant('5 lb', '5 lb box', '$', 'Common hand-drive box for framing.'), makeVariant('10 lb', '10 lb box', '$$', 'Bigger box for repeated framing jobs.'), makeVariant('30 lb', '30 lb box', '$$$', 'Bulk box for heavy framing use.')] },
			{ slug: 'drywall-screws', skuPrefix: 'FST-DRY', name: 'Drywall Screws', materialType: 'Drywall Screws', unit: 'box', bayStart: 9, uses: ['drywall', 'interior finishing', 'repairs'], variants: [makeVariant('1-1/4 in.', '1 lb box', '$', 'Short screw for thin wallboard.'), makeVariant('1-5/8 in.', '1 lb box', '$', 'Common drywall screw for wallboard.'), makeVariant('2 in.', '1 lb box', '$', 'Longer screw for thicker boards.'), makeVariant('2-1/2 in.', '1 lb box', '$$', 'Longer fastener for layered assemblies.')] },
			{ slug: 'wood-screws', skuPrefix: 'FST-WDS', name: 'Wood Screws', materialType: 'Wood Screws', unit: 'box', bayStart: 13, uses: ['general wood fastening', 'trim', 'repairs'], variants: [makeVariant('1 in.', '1 lb box', '$', 'Small screw for light fastening.'), makeVariant('1-1/4 in.', '1 lb box', '$', 'Common screw for trim work.'), makeVariant('2 in.', '1 lb box', '$', 'Useful size for general carpentry.'), makeVariant('2-1/2 in.', '1 lb box', '$$', 'Longer screw for stronger hold.')] },
			{ slug: 'anchors', skuPrefix: 'FST-ANC', name: 'Masonry Anchor', materialType: 'Anchor', unit: 'pack', bayStart: 17, uses: ['concrete', 'masonry', 'mounting'], variants: [makeVariant('10 pack', 'pack', '$', 'Small pack for quick installs.'), makeVariant('25 pack', 'pack', '$', 'Common pack for home projects.'), makeVariant('50 pack', 'pack', '$$', 'Bigger pack for repeated fastening.'), makeVariant('100 pack', 'pack', '$$$', 'Bulk pack for jobsite work.')] },
		],
	},
	26: {
		category: 'Fencing',
		families: [
			{ slug: 'cedar-pickets', skuPrefix: 'FNC-CED', name: 'Cedar Dog Ear Picket', materialType: 'Cedar', unit: 'each', bayStart: 1, uses: ['privacy fence', 'garden fence', 'gate panels'], variants: [makeVariant('5/8 x 5-1/2 x 6', '5/8 in. x 5-1/2 in. x 6 ft', '$', 'Classic cedar picket for vertical fence runs.'), makeVariant('5/8 x 5-1/2 x 8', '5/8 in. x 5-1/2 in. x 8 ft', '$', 'Longer picket for taller fence sections.'), makeVariant('3/4 x 5-1/2 x 6', '3/4 in. x 5-1/2 in. x 6 ft', '$$', 'Heavier picket for more durable fencing.'), makeVariant('3/4 x 5-1/2 x 8', '3/4 in. x 5-1/2 in. x 8 ft', '$$', 'Long picket for premium fencing.')] },
			{ slug: 'fence-rails', skuPrefix: 'FNC-RAI', name: 'Fence Rail', materialType: 'Fence Rail', unit: 'each', bayStart: 5, uses: ['fence rails', 'gate framing', 'support'], variants: [makeVariant('2 x 4 x 8', '2 x 4 x 8 ft', '$', 'Fence rail stock for horizontal runs.'), makeVariant('2 x 4 x 10', '2 x 4 x 10 ft', '$', 'Longer rail for wider fence sections.'), makeVariant('2 x 4 x 12', '2 x 4 x 12 ft', '$$', 'Extended rail for larger spans.'), makeVariant('2 x 6 x 12', '2 x 6 x 12 ft', '$$', 'Heavier rail for stronger fence lines.')] },
			{ slug: 'posts', skuPrefix: 'FNC-PST', name: 'Fence Post', materialType: 'Pressure Treated Post', unit: 'each', bayStart: 9, uses: ['fence posts', 'gate posts', 'supports'], variants: [makeVariant('4 x 4 x 8', '4 x 4 x 8 ft', '$$', 'Standard post for fence lines.'), makeVariant('4 x 4 x 10', '4 x 4 x 10 ft', '$$', 'Tall post for deeper set or taller fences.'), makeVariant('6 x 6 x 8', '6 x 6 x 8 ft', '$$$', 'Heavy post for premium projects.'), makeVariant('6 x 6 x 10', '6 x 6 x 10 ft', '$$$', 'Large post for structural fence builds.')] },
			{ slug: 'gate-hardware', skuPrefix: 'FNC-GAT', name: 'Gate Hardware', materialType: 'Gate Kit', unit: 'kit', bayStart: 13, uses: ['gate hardware', 'security', 'alignment'], variants: [makeVariant('Latch Kit', 'kit', '$$', 'Hardware kit for swinging fence gates.'), makeVariant('Hinge Set', 'pair', '$$', 'Heavy hinges for fence gates.'), makeVariant('Wheel Kit', 'kit', '$$', 'Adds support for larger gate spans.'), makeVariant('Drop Rod', 'each', '$', 'Locks a gate in place at the ground.')] },
			{ slug: 'tension-wire', skuPrefix: 'FNC-TNW', name: 'Fence Tension Wire', materialType: 'Wire', unit: 'spool', bayStart: 17, uses: ['chain link', 'tensioning', 'supports'], variants: [makeVariant('100 ft', '100 ft spool', '$', 'Small spool for quick fence repairs.'), makeVariant('300 ft', '300 ft spool', '$$', 'Common spool for fence runs.'), makeVariant('500 ft', '500 ft spool', '$$', 'Larger spool for longer lines.'), makeVariant('1000 ft', '1000 ft spool', '$$$', 'Bulk spool for bigger installs.')] },
		],
	},
	27: {
		category: 'Layout & Measuring',
		families: [
			{ slug: 'tape-measures', skuPrefix: 'LAY-TAP', name: 'Tape Measure', materialType: 'Measuring Tape', unit: 'each', bayStart: 1, uses: ['layout', 'framing', 'general measuring'], variants: [makeVariant('16 ft', '16 ft', '$', 'Compact tape for light use.'), makeVariant('25 ft', '25 ft', '$', 'Standard jobsite tape measure.'), makeVariant('35 ft', '35 ft', '$$', 'Longer tape for larger rooms.'), makeVariant('40 ft', '40 ft', '$$', 'Extra reach for bigger framing work.')] },
			{ slug: 'chalk-lines', skuPrefix: 'LAY-CHK', name: 'Chalk Line', materialType: 'String Line', unit: 'each', bayStart: 5, uses: ['marking', 'layout', 'straight reference lines'], variants: [makeVariant('100 ft', '100 ft', '$', 'Compact line reel for quick marks.'), makeVariant('150 ft', '150 ft', '$', 'Common length for framing layouts.'), makeVariant('200 ft', '200 ft', '$', 'Longer reel for bigger job sites.'), makeVariant('250 ft', '250 ft', '$$', 'Extended line for large layouts.')] },
			{ slug: 'levels', skuPrefix: 'LAY-LVL', name: 'Level', materialType: 'Level', unit: 'each', bayStart: 9, uses: ['plumb', 'leveling', 'alignment'], variants: [makeVariant('24 in.', '24 in.', '$', 'Short level for small projects.'), makeVariant('48 in.', '48 in.', '$$', 'Common level for framing.'), makeVariant('72 in.', '72 in.', '$$', 'Long level for larger surfaces.'), makeVariant('96 in.', '96 in.', '$$$', 'Extra-long level for big layouts.')] },
			{ slug: 'squares', skuPrefix: 'LAY-SQR', name: 'Square', materialType: 'Layout Tool', unit: 'each', bayStart: 13, uses: ['cut layout', 'roof framing', 'carpentry'], variants: [makeVariant('Speed', '7 in.', '$', 'Quick layout square for cuts.'), makeVariant('Framing', '7 in.', '$', 'Classic square for framing checks.'), makeVariant('Rafter', '8 in.', '$', 'Useful for roof layout and stair work.'), makeVariant('Combination', '12 in.', '$$', 'Adjustable layout square for many tasks.')] },
			{ slug: 'markers', skuPrefix: 'LAY-MRK', name: 'Marking Tool', materialType: 'Marker', unit: 'each', bayStart: 17, uses: ['marking', 'carpentry', 'layout'], variants: [makeVariant('Pencil Set', '12 pack', '$', 'Pencils for visible marks on rough lumber.'), makeVariant('Marker Set', '4 pack', '$', 'Durable markers for site use.'), makeVariant('Chalk Marker', 'each', '$', 'Temporary marking tool for rough surfaces.'), makeVariant('Carpenter Pencil', '12 pack', '$', 'Classic wedge pencil for framing marks.')] },
		],
	},
	28: {
		category: 'Roofing & Flashing',
		families: [
			{ slug: 'flashing-rolls', skuPrefix: 'ROF-FLS', name: 'Aluminum Flashing Roll', materialType: 'Aluminum Flashing', unit: 'roll', bayStart: 1, uses: ['windows', 'roof edges', 'waterproof transitions'], variants: [makeVariant('4 in. x 10 ft', '4 in. x 10 ft', '$', 'Small flashing roll for trim work.'), makeVariant('6 in. x 10 ft', '6 in. x 10 ft', '$$', 'Common flashing roll for roof repairs.'), makeVariant('8 in. x 10 ft', '8 in. x 10 ft', '$$', 'Wider flashing for larger seams.'), makeVariant('10 in. x 10 ft', '10 in. x 10 ft', '$$$', 'Wide flashing for bigger transitions.')] },
			{ slug: 'underlayment', skuPrefix: 'ROF-UND', name: 'Roof Underlayment', materialType: 'Underlayment', unit: 'roll', bayStart: 5, uses: ['roof decks', 'shingle prep', 'weather barrier'], variants: [makeVariant('1 sq', '1 sq roll', '$', 'Small roll for repair jobs.'), makeVariant('2 sq', '2 sq roll', '$$', 'Common roll for modest roof areas.'), makeVariant('4 sq', '4 sq roll', '$$', 'Larger roll for full sections.'), makeVariant('8 sq', '8 sq roll', '$$$', 'Bulk roll for bigger roofing jobs.')] },
			{ slug: 'drip-edge', skuPrefix: 'ROF-DRP', name: 'Drip Edge', materialType: 'Roof Edge Metal', unit: 'piece', bayStart: 9, uses: ['roof edges', 'fascia', 'water shedding'], variants: [makeVariant('10 ft', '10 ft strip', '$', 'Short piece for repair work.'), makeVariant('12 ft', '12 ft strip', '$', 'Common length for small roofs.'), makeVariant('16 ft', '16 ft strip', '$', 'Longer piece for bigger runs.'), makeVariant('20 ft', '20 ft strip', '$$', 'Bulk length for wider roof edges.')] },
			{ slug: 'roofing-nails', skuPrefix: 'ROF-NAL', name: 'Roofing Nails', materialType: 'Roofing Nails', unit: 'box', bayStart: 13, uses: ['shingles', 'roofing', 'fastening'], variants: [makeVariant('1 lb', '1 lb box', '$', 'Small box for patch jobs.'), makeVariant('5 lb', '5 lb box', '$', 'Handy box for routine roofing work.'), makeVariant('10 lb', '10 lb box', '$$', 'Bigger box for full installs.'), makeVariant('25 lb', '25 lb box', '$$$', 'Bulk box for contractor use.')] },
			{ slug: 'roof-cement', skuPrefix: 'ROF-CEM', name: 'Roof Cement', materialType: 'Sealant', unit: 'gal', bayStart: 17, uses: ['patching', 'flashing', 'sealant'], variants: [makeVariant('1 gal', '1 gal', '$$', 'Mastic for roofing repairs.'), makeVariant('5 gal', '5 gal', '$$$', 'Bulk pail for bigger repairs.'), makeVariant('10 gal', '10 gal', '$$$$', 'Contractor pail for large jobs.'), makeVariant('Tube', '10 oz tube', '$', 'Small tube for quick touch-ups.')] },
		],
	},
	29: {
		category: 'Weatherproofing',
		families: [
			{ slug: 'housewrap', skuPrefix: 'WTH-HWR', name: 'Housewrap', materialType: 'Housewrap', unit: 'roll', bayStart: 1, uses: ['air barrier', 'wall wrap', 'weather barrier'], variants: [makeVariant('9 ft x 100 ft', '9 ft x 100 ft', '$$', 'Compact roll for small walls.'), makeVariant('9 ft x 150 ft', '9 ft x 150 ft', '$$', 'Medium roll for average walls.'), makeVariant('10 ft x 100 ft', '10 ft x 100 ft', '$$$', 'Wider roll for larger sections.'), makeVariant('10 ft x 150 ft', '10 ft x 150 ft', '$$$', 'Bulk roll for full-house coverage.')] },
			{ slug: 'seam-tape', skuPrefix: 'WTH-TAP', name: 'Seam Tape', materialType: 'Seam Tape', unit: 'roll', bayStart: 5, uses: ['housewrap seams', 'air sealing', 'weather barrier repair'], variants: [makeVariant('1.5 in. x 75 ft', '1.5 in. x 75 ft', '$', 'Small tape roll for repairs.'), makeVariant('1.88 in. x 180 ft', '1.88 in. x 180 ft', '$$', 'Popular tape for seam sealing.'), makeVariant('3 in. x 90 ft', '3 in. x 90 ft', '$$', 'Wider tape for larger overlap areas.'), makeVariant('4 in. x 180 ft', '4 in. x 180 ft', '$$$', 'Heavy-duty roll for large installs.')] },
			{ slug: 'sill-gasket', skuPrefix: 'WTH-SIL', name: 'Sill Gasket', materialType: 'Foam Gasket', unit: 'roll', bayStart: 9, uses: ['sill sealing', 'air sealing', 'moisture break'], variants: [makeVariant('3.5 in. x 50 ft', '3.5 in. x 50 ft', '$', 'Small roll for standard 2x4 walls.'), makeVariant('5.5 in. x 50 ft', '5.5 in. x 50 ft', '$', 'Common roll for 2x6 wall plates.'), makeVariant('7.25 in. x 50 ft', '7.25 in. x 50 ft', '$$', 'Wider gasket for bigger framing.'), makeVariant('9.25 in. x 50 ft', '9.25 in. x 50 ft', '$$', 'Extra-wide gasket for large sill plates.')] },
			{ slug: 'spray-foam', skuPrefix: 'WTH-FOM', name: 'Spray Foam', materialType: 'Foam Sealant', unit: 'can', bayStart: 13, uses: ['gap fill', 'air sealing', 'insulation repair'], variants: [makeVariant('12 oz', '12 oz can', '$', 'Small can for minor gaps.'), makeVariant('16 oz', '16 oz can', '$', 'Common can for household sealing.'), makeVariant('24 oz', '24 oz can', '$$', 'Larger can for bigger openings.'), makeVariant('2-pack', '2-pack', '$$', 'Two-can pack for multiple repairs.')] },
			{ slug: 'window-tape', skuPrefix: 'WTH-WIN', name: 'Window and Door Flashing Tape', materialType: 'Flashing Tape', unit: 'roll', bayStart: 17, uses: ['openings', 'weatherproofing', 'penetrations'], variants: [makeVariant('3 in. x 75 ft', '3 in. x 75 ft', '$', 'Small roll for tighter seams.'), makeVariant('4 in. x 75 ft', '4 in. x 75 ft', '$$', 'Common opening tape for windows.'), makeVariant('6 in. x 75 ft', '6 in. x 75 ft', '$$', 'Wider tape for doors and openings.'), makeVariant('9 in. x 75 ft', '9 in. x 75 ft', '$$$', 'Wide roll for large openings.')] },
		],
	},
	30: {
		category: 'General Building Materials',
		families: [
			{ slug: 'utility-knife', skuPrefix: 'GEN-KNF', name: 'Utility Knife', materialType: 'Cutting Tool', unit: 'each', bayStart: 1, uses: ['cutting', 'opening', 'trimming'], variants: [makeVariant('Standard', 'standard', '$', 'Everyday cutting tool for jobsite tasks.'), makeVariant('Retractable', 'retractable', '$', 'Safer blade storage for pockets.'), makeVariant('Foldable', 'foldable', '$$', 'Compact knife for site use.'), makeVariant('Heavy Duty', 'heavy duty', '$$', 'Tough knife for rough cuts.')] },
			{ slug: 'ppe', skuPrefix: 'GEN-PPE', name: 'Safety Glasses', materialType: 'PPE', unit: 'pair', bayStart: 5, uses: ['safety', 'eye protection'], variants: [makeVariant('Clear', '1 pair', '$', 'Clear glasses for jobsite safety.'), makeVariant('Tinted', '1 pair', '$', 'Outdoor-friendly tinted lenses.'), makeVariant('Anti-Fog', '1 pair', '$$', 'Glasses with anti-fog lens coating.'), makeVariant('Over-Glasses', '1 pair', '$$', 'Fits over prescription glasses.')] },
			{ slug: 'cleanup', skuPrefix: 'GEN-CLN', name: 'Shop Towels', materialType: 'Cleaning Supplies', unit: 'pack', bayStart: 9, uses: ['cleanup', 'wiping', 'maintenance'], variants: [makeVariant('30 pack', '30 pack', '$', 'Absorbent towels for jobsite cleaning.'), makeVariant('60 pack', '60 pack', '$$', 'Bigger pack for repeated cleanup.'), makeVariant('120 pack', '120 pack', '$$', 'Bulk pack for longer projects.'), makeVariant('240 pack', '240 pack', '$$$', 'Large case for contractor use.')] },
			{ slug: 'adhesive', skuPrefix: 'GEN-ADH', name: 'Construction Adhesive', materialType: 'Adhesive', unit: 'tube', bayStart: 13, uses: ['bonding', 'repairs', 'trim'], variants: [makeVariant('10 oz', '10 oz tube', '$', 'Heavy-duty adhesive for building projects.'), makeVariant('28 oz', '28 oz tube', '$$', 'Bigger tube for larger jobs.'), makeVariant('30 oz', '30 oz tube', '$$', 'Bulk tube for repeated use.'), makeVariant('Foamboard', '10 oz tube', '$', 'Formula for foam board applications.')] },
			{ slug: 'buckets', skuPrefix: 'GEN-BKT', name: 'Pail', materialType: 'Bucket', unit: 'each', bayStart: 17, uses: ['mixing', 'transport', 'cleanup'], variants: [makeVariant('1 gal', '1 gal', '$', 'Small pail for light use.'), makeVariant('2 gal', '2 gal', '$', 'Compact bucket for general tasks.'), makeVariant('5 gal', '5 gal', '$$', 'Multipurpose work bucket.'), makeVariant('Lid Kit', 'kit', '$', 'Adds a lid for storage and transport.')] },
		],
	},
	31: {
		category: 'Project Finish',
		families: [
			{ slug: 'casing', skuPrefix: 'FIN-CSG', name: 'Window and Door Casing', materialType: 'Finish Trim', unit: 'stick', bayStart: 1, uses: ['trim', 'finish work', 'openings'], variants: [makeVariant('16 ft', '16 ft stick', '$$', 'Finish trim for windows and doors.'), makeVariant('12 ft', '12 ft stick', '$$', 'Shorter stick for smaller rooms.'), makeVariant('10 ft', '10 ft stick', '$', 'Compact trim for tight areas.'), makeVariant('8 ft', '8 ft stick', '$', 'Easy-to-handle trim length.')] },
			{ slug: 'baseboard', skuPrefix: 'FIN-BAS', name: 'Baseboard Moulding', materialType: 'Trim', unit: 'stick', bayStart: 5, uses: ['trim', 'finish work', 'base detail'], variants: [makeVariant('3-1/4 in.', '12 ft stick', '$$', 'Classic baseboard profile.'), makeVariant('5-1/4 in.', '12 ft stick', '$$', 'Wider profile for larger rooms.'), makeVariant('7-1/4 in.', '12 ft stick', '$$$', 'Deep baseboard for formal spaces.'), makeVariant('1 x 6', '12 ft stick', '$', 'Plain board style trim.')] },
			{ slug: 'crown', skuPrefix: 'FIN-CRN', name: 'Crown Moulding', materialType: 'Trim', unit: 'stick', bayStart: 9, uses: ['trim', 'finish work', 'ceilings'], variants: [makeVariant('Small', '12 ft stick', '$$', 'Simple ceiling trim.'), makeVariant('Medium', '12 ft stick', '$$', 'Common crown profile.'), makeVariant('Large', '12 ft stick', '$$$', 'Bolder profile for larger rooms.'), makeVariant('Decorative', '12 ft stick', '$$$$', 'Highly detailed moulding profile.')] },
			{ slug: 'filler', skuPrefix: 'FIN-FIL', name: 'Wood Filler', materialType: 'Filler', unit: 'container', bayStart: 13, uses: ['patching', 'finishing', 'repairs'], variants: [makeVariant('6 oz', '6 oz', '$', 'Small container for quick repairs.'), makeVariant('16 oz', '16 oz', '$', 'Standard tub for small jobs.'), makeVariant('32 oz', '32 oz', '$$', 'Larger tub for repeated patch work.'), makeVariant('1 gal', '1 gal', '$$$', 'Bulk filler for bigger finish work.')] },
			{ slug: 'sandpaper', skuPrefix: 'FIN-SNP', name: 'Sandpaper Assortment', materialType: 'Abrasive', unit: 'pack', bayStart: 17, uses: ['sanding', 'prep', 'finishing'], variants: [makeVariant('10 sheet', '10 sheet pack', '$', 'Mixed grit finishing sheets.'), makeVariant('20 sheet', '20 sheet pack', '$$', 'Larger pack for repeat sanding.'), makeVariant('50 sheet', '50 sheet pack', '$$', 'Bulk pack for bigger finish work.'), makeVariant('Assorted', 'assorted pack', '$', 'Mixed pack for general prep.')] },
		],
	},
};

const THD_PRODUCTS = Object.entries(AISLE_TEMPLATE).flatMap(([aisleNumber, aisleConfig]) => buildSeedProducts(Number(aisleNumber), aisleConfig.category, aisleConfig.families));
/*
				],
			},
			{
				slug: 'carriage-bolts',
				skuPrefix: 'FST-CAR',
				name: 'Carriage Bolts',
				materialType: 'Carriage Bolt',
				unit: 'each',
				uses: ['fencing', 'playsets', 'timber connections'],
				variants: [
					makeVariant('1/4 x 2', 'each', '$', 'Small bolt for lighter wood joints.'),
					makeVariant('5/16 x 4', 'each', '$', 'Common size for medium wood connections.'),
					makeVariant('3/8 x 6', 'each', '$', 'Popular size for larger connections.'),
					makeVariant('1/2 x 8', 'each', '$$', 'Heavy bolt for bigger builds.'),
				],
			},
		],
	},
	{
		aisle: 25,
		category: 'Layout & Measuring',
		families: [
			{
				slug: 'tape-measures',
				skuPrefix: 'MEA-TAP',
				name: 'Tape Measure',
				materialType: 'Measuring Tape',
				unit: 'each',
				uses: ['layout', 'framing', 'general measuring'],
				variants: [
					makeVariant('16 ft', 'each', '$', 'Compact tape for light use.'),
					makeVariant('25 ft', 'each', '$', 'Standard jobsite tape measure.'),
					makeVariant('35 ft', 'each', '$$', 'Longer tape for larger rooms.'),
					makeVariant('40 ft', 'each', '$$', 'Extra reach for bigger framing work.'),
				],
			},
			{
				slug: 'chalk-lines',
				skuPrefix: 'MEA-CHK',
				name: 'Chalk Line',
				materialType: 'String Line',
				unit: 'each',
				uses: ['marking', 'layout', 'straight reference lines'],
				variants: [
					makeVariant('100 ft', 'each', '$', 'Compact line reel for quick marks.'),
					makeVariant('150 ft', 'each', '$', 'Common length for framing layouts.'),
					makeVariant('200 ft', 'each', '$', 'Longer reel for bigger job sites.'),
					makeVariant('250 ft', 'each', '$$', 'Extended line for large layouts.'),
				],
			},
			{
				slug: 'levels',
				skuPrefix: 'MEA-LVL',
				name: 'Level',
				materialType: 'Level',
				unit: 'each',
				uses: ['plumb', 'leveling', 'alignment'],
				variants: [
					makeVariant('24 in.', 'each', '$', 'Short level for small projects.'),
					makeVariant('48 in.', 'each', '$$', 'Common level for framing.'),
					makeVariant('72 in.', 'each', '$$', 'Long level for larger surfaces.'),
					makeVariant('96 in.', 'each', '$$$', 'Extra-long level for big layouts.'),
				],
			},
			{
				slug: 'squares',
				skuPrefix: 'MEA-SQR',
				name: 'Square',
				materialType: 'Layout Tool',
				unit: 'each',
				uses: ['cut layout', 'roof framing', 'carpentry'],
				variants: [
					makeVariant('Speed', 'each', '$', 'Quick layout square for cuts.'),
					makeVariant('Framing', 'each', '$', 'Classic square for framing checks.'),
					makeVariant('Rafter', 'each', '$', 'Useful for roof layout and stair work.'),
					makeVariant('Combination', 'each', '$$', 'Adjustable layout square for many tasks.'),
				],
			},
		],
	},
	{
		aisle: 26,
		category: 'Roofing & Flashing',
		families: [
			{
				slug: 'flashing-rolls',
				skuPrefix: 'ROF-FLS',
				name: 'Aluminum Flashing Roll',
				materialType: 'Aluminum Flashing',
				unit: 'roll',
				uses: ['windows', 'roof edges', 'waterproof transitions'],
				variants: [
					makeVariant('4 in. x 10 ft', 'roll', '$', 'Small flashing roll for trim work.'),
					makeVariant('6 in. x 10 ft', 'roll', '$$', 'Common flashing roll for roof repairs.'),
					makeVariant('8 in. x 10 ft', 'roll', '$$', 'Wider flashing for larger seams.'),
					makeVariant('10 in. x 10 ft', 'roll', '$$$', 'Wide flashing for bigger transitions.'),
				],
			},
			{
				slug: 'underlayment',
				skuPrefix: 'ROF-UND',
				name: 'Roof Underlayment',
				materialType: 'Underlayment',
				unit: 'roll',
				uses: ['roof decks', 'shingle prep', 'weather barrier'],
				variants: [
					makeVariant('1 sq', 'roll', '$', 'Small roll for repair jobs.'),
					makeVariant('2 sq', 'roll', '$$', 'Common roll for modest roof areas.'),
					makeVariant('4 sq', 'roll', '$$', 'Larger roll for full sections.'),
					makeVariant('8 sq', 'roll', '$$$', 'Bulk roll for bigger roofing jobs.'),
				],
			},
			{
				slug: 'drip-edge',
				skuPrefix: 'ROF-DRP',
				name: 'Drip Edge',
				materialType: 'Roof Edge Metal',
				unit: 'piece',
				uses: ['roof edges', 'fascia', 'water shedding'],
				variants: [
					makeVariant('10 ft', 'piece', '$', 'Short piece for repair work.'),
					makeVariant('12 ft', 'piece', '$', 'Common length for small roofs.'),
					makeVariant('16 ft', 'piece', '$', 'Longer piece for bigger runs.'),
					makeVariant('20 ft', 'piece', '$$', 'Bulk length for wider roof edges.'),
				],
			},
			{
				slug: 'roofing-nails',
				skuPrefix: 'ROF-NAL',
				name: 'Roofing Nails',
				materialType: 'Roofing Nails',
				unit: 'box',
				uses: ['shingles', 'underlayment', 'roof repair'],
				variants: [
					makeVariant('1 lb', 'box', '$', 'Small box for patch jobs.'),
					makeVariant('5 lb', 'box', '$', 'Handy box for routine roofing work.'),
					makeVariant('10 lb', 'box', '$$', 'Bigger box for full installs.'),
					makeVariant('25 lb', 'box', '$$$', 'Bulk box for contractor use.'),
				],
			},
		],
	},
	{
		aisle: 27,
		category: 'Weatherproofing',
		families: [
			{
				slug: 'housewrap',
				skuPrefix: 'WEA-HWR',
				name: 'Housewrap',
				materialType: 'Housewrap',
				unit: 'roll',
				uses: ['air barrier', 'wall wrap', 'weather barrier'],
				variants: [
					makeVariant('9 ft x 100 ft', 'roll', '$$', 'Compact roll for small walls.'),
					makeVariant('9 ft x 150 ft', 'roll', '$$', 'Medium roll for average walls.'),
					makeVariant('10 ft x 100 ft', 'roll', '$$$', 'Wider roll for larger sections.'),
					makeVariant('10 ft x 150 ft', 'roll', '$$$', 'Bulk roll for full-house coverage.'),
				],
			},
			{
				slug: 'seam-tape',
				skuPrefix: 'WEA-TAP',
				name: 'Seam Tape',
				materialType: 'Seam Tape',
				unit: 'roll',
				uses: ['housewrap seams', 'air sealing', 'weather barrier repair'],
				variants: [
					makeVariant('1.5 in. x 75 ft', 'roll', '$', 'Small tape roll for repairs.'),
					makeVariant('1.88 in. x 180 ft', 'roll', '$$', 'Popular tape for seam sealing.'),
					makeVariant('3 in. x 90 ft', 'roll', '$$', 'Wider tape for larger overlap areas.'),
					makeVariant('4 in. x 180 ft', 'roll', '$$$', 'Heavy-duty roll for large installs.'),
				],
			},
			{
				slug: 'sill-gasket',
				skuPrefix: 'WEA-SIL',
				name: 'Sill Gasket',
				materialType: 'Foam Gasket',
				unit: 'roll',
				uses: ['sill sealing', 'air sealing', 'moisture break'],
				variants: [
					makeVariant('3.5 in. x 50 ft', 'roll', '$', 'Small roll for standard 2x4 walls.'),
					makeVariant('5.5 in. x 50 ft', 'roll', '$', 'Common roll for 2x6 wall plates.'),
					makeVariant('7.25 in. x 50 ft', 'roll', '$$', 'Wider gasket for bigger framing.'),
					makeVariant('9.25 in. x 50 ft', 'roll', '$$', 'Extra-wide gasket for large sill plates.'),
				],
			},
			{
				slug: 'spray-foam',
				skuPrefix: 'WEA-FOM',
				name: 'Spray Foam',
				materialType: 'Foam Sealant',
				unit: 'can',
				uses: ['gap fill', 'air sealing', 'insulation repair'],
				variants: [
					makeVariant('12 oz', 'can', '$', 'Small can for minor gaps.'),
					makeVariant('16 oz', 'can', '$', 'Common can for household sealing.'),
					makeVariant('24 oz', 'can', '$$', 'Larger can for bigger openings.'),
					makeVariant('2-pack', 'pack', '$$', 'Two-can pack for multiple repairs.'),
				],
			},
		],
	},
	{
		aisle: 28,
		category: 'Sheet Goods',
		families: [
			{
				slug: 'cdx-plywood',
				skuPrefix: 'SHT-CDX',
				name: 'CDX Plywood',
				materialType: 'Plywood',
				unit: 'sheet',
				uses: ['sheathing', 'roof decking', 'shed walls'],
				variants: [
					makeVariant('1/4 in.', '4 ft x 8 ft', '$$', 'Thin sheet for light sheathing.'),
					makeVariant('3/8 in.', '4 ft x 8 ft', '$$', 'Common utility sheet for projects.'),
					makeVariant('1/2 in.', '4 ft x 8 ft', '$$', 'Popular sheathing thickness.'),
					makeVariant('5/8 in.', '4 ft x 8 ft', '$$$', 'Thicker sheet for structural use.'),
				],
			},
			{
				slug: 'osb',
				skuPrefix: 'SHT-OSB',
				name: 'OSB',
				materialType: 'OSB',
				unit: 'sheet',
				uses: ['subfloor', 'wall sheathing', 'platform framing'],
				variants: [
					makeVariant('7/16 in.', '4 ft x 8 ft', '$$', 'Light OSB for wall sheathing.'),
					makeVariant('19/32 in.', '4 ft x 8 ft', '$$', 'Common OSB for floor systems.'),
					makeVariant('23/32 in.', '4 ft x 8 ft', '$$$', 'T&G-friendly subfloor thickness.'),
					makeVariant('7/8 in.', '4 ft x 8 ft', '$$$$', 'Thicker structural OSB panel.'),
				],
			},
			{
				slug: 'birch-plywood',
				skuPrefix: 'SHT-BIR',
				name: 'Birch Plywood',
				materialType: 'Birch Plywood',
				unit: 'sheet',
				uses: ['cabinets', 'shelving', 'built-ins'],
				variants: [
					makeVariant('1/4 in.', '4 ft x 8 ft', '$$$', 'Light finish-grade panel.'),
					makeVariant('1/2 in.', '4 ft x 8 ft', '$$$', 'Common cabinet and casework sheet.'),
					makeVariant('3/4 in.', '4 ft x 8 ft', '$$$$', 'Stiff sheet for furniture and built-ins.'),
					makeVariant('1 in.', '4 ft x 8 ft', '$$$$', 'Heavier sheet for premium finish work.'),
				],
			},
			{
				slug: 'subfloor',
				skuPrefix: 'SHT-SUB',
				name: 'Subfloor Panel',
				materialType: 'T&G Panel',
				unit: 'sheet',
				uses: ['flooring', 'platform framing', 'attic deck'],
				variants: [
					makeVariant('T&G 23/32', '4 ft x 8 ft', '$$$', 'Standard tongue-and-groove subfloor panel.'),
					makeVariant('T&G 1 in.', '4 ft x 8 ft', '$$$$', 'Thick subfloor for heavy traffic.'),
					makeVariant('Premium', '4 ft x 8 ft', '$$$$', 'Higher-end structural floor panel.'),
					makeVariant('Utility', '4 ft x 8 ft', '$$', 'Budget subfloor panel for simple builds.'),
				],
			},
		],
	},
	{
		aisle: 29,
		category: 'Dimensional Lumber',
		families: [
			{
				slug: 'spf-studs',
				skuPrefix: 'LMB-SPF',
				name: 'SPF Stud',
				materialType: 'SPF',
				unit: 'each',
				uses: ['interior walls', 'framing', 'blocking'],
				variants: [
					makeVariant('2 x 4 x 8', 'each', '$', 'Standard stud for interior framing.'),
					makeVariant('2 x 4 x 10', 'each', '$', 'Longer stud for taller walls.'),
					makeVariant('2 x 4 x 12', 'each', '$$', 'Extended stud for utility framing.'),
					makeVariant('2 x 4 x 16', 'each', '$$', 'Long stud for larger wall runs.'),
				],
			},
			{
				slug: 'pressure-treated',
				skuPrefix: 'LMB-PT',
				name: 'Pressure Treated Lumber',
				materialType: 'Pressure Treated',
				unit: 'each',
				uses: ['deck framing', 'stairs', 'outdoor structures'],
				variants: [
					makeVariant('2 x 4', 'each', '$$', 'Small PT board for outdoor framing.'),
					makeVariant('2 x 6', 'each', '$$', 'Common PT board for deck work.'),
					makeVariant('2 x 8', 'each', '$$$', 'Heavier PT board for deck joists.'),
					makeVariant('4 x 4', 'each', '$$$', 'Popular PT post size for exterior builds.'),
				],
			},
			{
				slug: 'douglas-fir',
				skuPrefix: 'LMB-DF',
				name: 'Douglas Fir Board',
				materialType: 'Douglas Fir',
				unit: 'each',
				uses: ['joists', 'rafters', 'beams'],
				variants: [
					makeVariant('2 x 6', 'each', '$$', 'Common framing member for span work.'),
					makeVariant('2 x 8', 'each', '$$$', 'Heavier board for joists and rafters.'),
					makeVariant('2 x 10', 'each', '$$$', 'Longer board for wider spans.'),
					makeVariant('2 x 12', 'each', '$$$$', 'Large board for heavy structural work.'),
				],
			},
			{
				slug: 'lvl-beam',
				skuPrefix: 'LMB-LVL',
				name: 'LVL Beam',
				materialType: 'Engineered Lumber',
				unit: 'each',
				uses: ['headers', 'beams', 'load bearing spans'],
				variants: [
					makeVariant('1.75 x 9.25', 'each', '$$$$', 'Slim engineered beam for headers.'),
					makeVariant('1.75 x 11.875', 'each', '$$$$', 'Common beam size for medium spans.'),
					makeVariant('1.75 x 14', 'each', '$$$$', 'Larger beam for stronger load paths.'),
					makeVariant('1.75 x 16', 'each', '$$$$$', 'Big beam for major load-bearing work.'),
				],
			},
		],
	},
	{
		aisle: 30,
		category: 'Appearance Boards',
		families: [
			{
				slug: 'cedar-pickets',
				skuPrefix: 'APP-CED',
				name: 'Cedar Picket',
				materialType: 'Cedar',
				unit: 'each',
				uses: ['privacy fence', 'garden fence', 'gate panels'],
				variants: [
					makeVariant('5/8 x 5-1/2 x 6', 'each', '$', 'Classic picket for fence runs.'),
					makeVariant('5/8 x 5-1/2 x 8', 'each', '$', 'Longer picket for taller fence sections.'),
					makeVariant('3/4 x 5-1/2 x 6', 'each', '$$', 'Heavier picket for more durable fencing.'),
					makeVariant('3/4 x 5-1/2 x 8', 'each', '$$', 'Long picket for premium fencing.'),
				],
			},
			{
				slug: 'redwood-boards',
				skuPrefix: 'APP-RWD',
				name: 'Redwood Board',
				materialType: 'Redwood',
				unit: 'each',
				uses: ['planters', 'trim', 'benches'],
				variants: [
					makeVariant('2 x 4 x 8', 'each', '$$$', 'Compact board for trim and accents.'),
					makeVariant('2 x 6 x 8', 'each', '$$$', 'Common outdoor finish board.'),
					makeVariant('2 x 4 x 12', 'each', '$$$', 'Longer board for benches and edging.'),
					makeVariant('2 x 6 x 12', 'each', '$$$$', 'Premium board for larger outdoor projects.'),
				],
			},
			{
				slug: 'fascia-boards',
				skuPrefix: 'APP-FSC',
				name: 'Fascia Board',
				materialType: 'Trim Board',
				unit: 'each',
				uses: ['fascia', 'finish trim', 'edge banding'],
				variants: [
					makeVariant('1 x 6 x 12', 'each', '$$', 'Standard trim board size.'),
					makeVariant('1 x 8 x 12', 'each', '$$$', 'Wider fascia for larger roofs.'),
					makeVariant('1 x 10 x 12', 'each', '$$$', 'Deep fascia board for finish work.'),
					makeVariant('1 x 12 x 12', 'each', '$$$$', 'Wide fascia board for bigger facades.'),
				],
			},
			{
				slug: 'trim-boards',
				skuPrefix: 'APP-TRM',
				name: 'Trim Board',
				materialType: 'Trim Lumber',
				unit: 'each',
				uses: ['window trim', 'door trim', 'finish carpentry'],
				variants: [
					makeVariant('1 x 4 x 8', 'each', '$$', 'Small trim board for detailed work.'),
					makeVariant('1 x 6 x 8', 'each', '$$', 'Common trim board for many projects.'),
					makeVariant('1 x 8 x 8', 'each', '$$$', 'Wider trim for large openings.'),
					makeVariant('1 x 12 x 8', 'each', '$$$', 'Very wide trim for specialty finish work.'),
				],
			},
		],
	},
	{
		aisle: 31,
		category: 'Adhesives & Sealants',
		families: [
			{
				slug: 'construction-adhesive',
				skuPrefix: 'ADH-CON',
				name: 'Construction Adhesive',
				materialType: 'Adhesive',
				unit: 'tube',
				uses: ['panel install', 'subfloor', 'general bonding'],
				variants: [
					makeVariant('10 oz', 'tube', '$', 'Small tube for quick fixes.'),
					makeVariant('28 oz', 'tube', '$', 'Common caulk-style construction tube.'),
					makeVariant('29 oz', 'tube', '$$', 'Large tube for bigger projects.'),
					makeVariant('30 oz', 'tube', '$$', 'Bulk tube for repeated use.'),
				],
			},
			{
				slug: 'caulk',
				skuPrefix: 'ADH-CAU',
				name: 'Caulk',
				materialType: 'Sealant',
				unit: 'tube',
				uses: ['gaps', 'trim', 'weather sealing'],
				variants: [
					makeVariant('Latex', 'tube', '$', 'Paintable sealant for interior trim.'),
					makeVariant('Siliconized', 'tube', '$', 'Flexible sealant for mixed surfaces.'),
					makeVariant('Polyurethane', 'tube', '$$', 'Tough sealant for exterior work.'),
					makeVariant('Paintable', 'tube', '$$', 'Finish-friendly sealant for visible joints.'),
				],
			},
			{
				slug: 'wood-filler',
				skuPrefix: 'ADH-FIL',
				name: 'Wood Filler',
				materialType: 'Filler',
				unit: 'container',
				uses: ['hole fill', 'surface repair', 'finish prep'],
				variants: [
					makeVariant('6 oz', 'container', '$', 'Small container for quick repairs.'),
					makeVariant('16 oz', 'container', '$', 'Standard tub for small jobs.'),
					makeVariant('32 oz', 'container', '$$', 'Larger tub for repeated patch work.'),
					makeVariant('1 gal', 'container', '$$$', 'Bulk filler for bigger finish work.'),
				],
			},
			{
				slug: 'anchor-epoxy',
				skuPrefix: 'ADH-EPX',
				name: 'Anchor Epoxy',
				materialType: 'Epoxy',
				unit: 'kit',
				uses: ['rebar', 'anchors', 'heavy-duty fastening'],
				variants: [
					makeVariant('8.6 oz', 'kit', '$$', 'Small epoxy kit for anchor installs.'),
					makeVariant('10 oz', 'kit', '$$', 'Standard epoxy kit for setting anchors.'),
					makeVariant('20 oz', 'kit', '$$$', 'Larger kit for repeated anchor work.'),
					makeVariant('30 oz', 'kit', '$$$$', 'Bulk kit for contractor anchor installs.'),
				],
			},
		],
	},
];

const THD_PRODUCTS = SEED_SECTIONS.flatMap((section) => buildSeedProducts(section.aisle, section.category, section.families));
	*/

const normalizeUses = (value) => value
	.split(',')
	.map((entry) => entry.trim())
	.filter(Boolean);

const buildProductFromForm = (formState, existingId = null) => ({
	id: existingId || `thd-custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
	sku: formState.sku.trim(),
	name: formState.name.trim(),
	category: formState.category.trim(),
	materialType: formState.materialType.trim(),
	size: formState.size.trim(),
	aisle: formState.aisle.trim(),
	bay: formState.bay.trim(),
	unit: formState.unit.trim(),
	price: formState.price.trim() || '$',
	uses: normalizeUses(formState.uses),
	notes: formState.notes.trim(),
});

const mapProductToForm = (product) => ({
	sku: product.sku || '',
	name: product.name || '',
	category: product.category || '',
	materialType: product.materialType || '',
	size: product.size || '',
	aisle: product.aisle || '',
	bay: product.bay || '',
	unit: product.unit || '',
	price: product.price || '$',
	uses: Array.isArray(product.uses) ? product.uses.join(', ') : '',
	notes: product.notes || '',
});

const getAisleNumber = (aisle) => {
	const match = String(aisle || '').match(/(\d+)/);
	return match ? Number(match[1]) : null;
};

const parseStoredProducts = () => {
	try {
		const raw = localStorage.getItem(THD_PRODUCTS_STORAGE_KEY);
		if (!raw) return THD_PRODUCTS;
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed) || !parsed.length) return THD_PRODUCTS;
		const validStoredProducts = parsed.filter((item) => (
			item
			&& typeof item.id === 'string'
			&& typeof item.sku === 'string'
			&& typeof item.name === 'string'
			&& typeof item.category === 'string'
			&& typeof item.materialType === 'string'
			&& typeof item.size === 'string'
			&& typeof item.aisle === 'string'
			&& typeof item.bay === 'string'
			&& typeof item.unit === 'string'
			&& typeof item.price === 'string'
			&& Array.isArray(item.uses)
			&& typeof item.notes === 'string'
		)).filter((item) => (
			item.id.startsWith('thd-custom-')
			|| (() => {
				const aisleNumber = getAisleNumber(item.aisle);
				return aisleNumber !== null && aisleNumber >= 21 && aisleNumber <= 31;
			})()
		));
		const productsById = new Map(THD_PRODUCTS.map((product) => [product.id, product]));
		validStoredProducts.forEach((product) => {
			productsById.set(product.id, product);
		});
		return Array.from(productsById.values());
	} catch {
		return THD_PRODUCTS;
	}
};

const THD = () => {
	const [products, setProducts] = useState(() => parseStoredProducts());
	const [query, setQuery] = useState('');
	const [category, setCategory] = useState('all');
	const [materialType, setMaterialType] = useState('all');
	const [finderCollapsed, setFinderCollapsed] = useState(false);
	const [managerCollapsed, setManagerCollapsed] = useState(true);
	const [formState, setFormState] = useState(DEFAULT_PRODUCT_FORM);
	const [editingProductId, setEditingProductId] = useState('');
	const [isScanningBarcode, setIsScanningBarcode] = useState(false);
	const [scannerError, setScannerError] = useState('');
	const [lastScannedCode, setLastScannedCode] = useState('');
	const videoRef = useRef(null);
	const streamRef = useRef(null);
	const scanTimerRef = useRef(null);

	const stopBarcodeScanner = () => {
		if (scanTimerRef.current) {
			clearInterval(scanTimerRef.current);
			scanTimerRef.current = null;
		}
		if (streamRef.current) {
			streamRef.current.getTracks().forEach((track) => track.stop());
			streamRef.current = null;
		}
		if (videoRef.current) {
			videoRef.current.srcObject = null;
		}
		setIsScanningBarcode(false);
	};

	const applyScannedCode = (rawCode) => {
		const code = String(rawCode || '').trim();
		if (!code) return;
		setFormState((prev) => ({
			...prev,
			sku: code,
			name: prev.name || `Scanned Product ${code}`,
		}));
		setLastScannedCode(code);
		setScannerError('');
		stopBarcodeScanner();
	};

	const startBarcodeScanner = async () => {
		setScannerError('');
		const BarcodeDetectorApi = window.BarcodeDetector;
		if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
			setScannerError('Camera access is not supported in this browser.');
			return;
		}
		if (!BarcodeDetectorApi) {
			setScannerError('Barcode scanning is not supported in this browser. Enter SKU manually or use a supported mobile browser.');
			return;
		}

		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: {
					facingMode: { ideal: 'environment' },
				},
				audio: false,
			});
			streamRef.current = stream;
			setIsScanningBarcode(true);

			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				await videoRef.current.play();
			}

			const detector = new BarcodeDetectorApi({
				formats: ['upc_a', 'upc_e', 'ean_13', 'ean_8', 'code_128', 'code_39', 'qr_code'],
			});

			scanTimerRef.current = setInterval(async () => {
				if (!videoRef.current || videoRef.current.readyState < 2) return;
				try {
					const codes = await detector.detect(videoRef.current);
					if (codes && codes.length > 0) {
						const firstCode = codes[0];
						applyScannedCode(firstCode.rawValue || '');
					}
				} catch {
					setScannerError('Scanning is active, but no readable barcode has been detected yet.');
				}
			}, 500);
		} catch {
			stopBarcodeScanner();
			setScannerError('Unable to start the camera. Check browser camera permissions and try again.');
		}
	};

	useEffect(() => {
		localStorage.setItem(THD_PRODUCTS_STORAGE_KEY, JSON.stringify(products));
	}, [products]);

	useEffect(() => () => {
		stopBarcodeScanner();
	}, []);

	const categories = useMemo(
		() => ['all', ...Array.from(new Set(products.map((item) => item.category)))],
		[products]
	);

	const materialTypes = useMemo(
		() => ['all', ...Array.from(new Set(products.map((item) => item.materialType)))],
		[products]
	);

	const filteredProducts = useMemo(() => {
		const search = query.trim().toLowerCase();
		return products.filter((item) => {
			const matchesCategory = category === 'all' || item.category === category;
			const matchesMaterialType = materialType === 'all' || item.materialType === materialType;
			const haystack = [
				item.sku,
				item.name,
				item.category,
				item.materialType,
				item.size,
				item.aisle,
				item.bay,
				item.notes,
				...(item.uses || []),
			].join(' ').toLowerCase();
			const matchesQuery = !search || haystack.includes(search);
			return matchesCategory && matchesMaterialType && matchesQuery;
		});
	}, [category, materialType, products, query]);

	const handleFieldChange = (field) => (event) => {
		setFormState((prev) => ({
			...prev,
			[field]: event.target.value,
		}));
	};

	const resetForm = () => {
		setFormState(DEFAULT_PRODUCT_FORM);
		setEditingProductId('');
		setLastScannedCode('');
		setScannerError('');
		stopBarcodeScanner();
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		const nextProduct = buildProductFromForm(formState, editingProductId || null);
		if (!nextProduct.sku || !nextProduct.name || !nextProduct.category || !nextProduct.materialType) {
			return;
		}
		setProducts((prev) => {
			if (!editingProductId) return [...prev, nextProduct];
			return prev.map((item) => (item.id === editingProductId ? nextProduct : item));
		});
		resetForm();
	};

	const handleEditProduct = (product) => {
		stopBarcodeScanner();
		setScannerError('');
		setLastScannedCode('');
		setEditingProductId(product.id);
		setFormState(mapProductToForm(product));
		setManagerCollapsed(false);
	};

	const handleDeleteProduct = (productId) => {
		setProducts((prev) => prev.filter((item) => item.id !== productId));
		if (editingProductId === productId) resetForm();
	};

	return (
		<div className='containerDetail mt--30 bg-lite color-lite width--10'>
			<div className='containerDetail p-20 size30 color-lite bg-lite contentLeft mb-5'>
				{icons.thd || '🧰'} THD
			</div>

			<div className='containerDetail bg-lite mb-5 p-20 contentLeft'>
				<div className='color-yellow size20'>{STORE_INFO.name}</div>
				<div className='mt-5'>{STORE_INFO.address}</div>
				<div className='mt-5 color-orange'>{STORE_INFO.focus}</div>
				<div className='mt-5'>Aisles 21 to 31 include approximate default aisle and bay placements for offline planning until verified in-store.</div>
			</div>

			<div className='containerDetail bg-lite mb-5'>
				<CollapseToggleButton
					title={<span className='color-yellow'>Offline Product Finder</span>}
					isCollapsed={finderCollapsed}
					setCollapse={setFinderCollapsed}
					align='left'
				/>
				{finderCollapsed ? null : (
					<div className='containerDetail p-10'>
						<input
							className='containerDetail p-10 m-5 color-lite width--10'
							type='text'
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder='Search by SKU, product, use, aisle, bay, or material'
							aria-label='Search Encinitas Home Depot building materials'
						/>
						<select
							className='containerDetail p-10 m-5 color-lite width--10'
							value={category}
							onChange={(event) => setCategory(event.target.value)}
							aria-label='Filter by product category'
						>
							{categories.map((value) => (
								<option key={value} value={value}>
									{value === 'all' ? 'All categories' : value}
								</option>
							))}
						</select>
						<select
							className='containerDetail p-10 m-5 color-lite width--10'
							value={materialType}
							onChange={(event) => setMaterialType(event.target.value)}
							aria-label='Filter by material type'
						>
							{materialTypes.map((value) => (
								<option key={value} value={value}>
									{value === 'all' ? 'All material types' : value}
								</option>
							))}
						</select>
					</div>
				)}
			</div>

			<div className='containerDetail bg-lite mb-5'>
				<CollapseToggleButton
					title={<span className='color-yellow'>{editingProductId ? 'Edit Product' : 'Manage Offline Catalog'}</span>}
					isCollapsed={managerCollapsed}
					setCollapse={setManagerCollapsed}
					align='left'
				/>
				{managerCollapsed ? null : (
					<form className='containerDetail p-10 contentLeft' onSubmit={handleSubmit}>
						<div className='m-5 color-orange'>Required fields: SKU, product name, category, and material type.</div>
						<div className='m-5'>
							<button
								className='containerDetail p-10 m-5 color-lite bg-lite'
								type='button'
								onClick={isScanningBarcode ? stopBarcodeScanner : startBarcodeScanner}
								aria-label={isScanningBarcode ? 'Stop barcode scanning' : 'Scan barcode with camera'}
							>
								{isScanningBarcode ? 'Stop Barcode Scanner' : 'Scan Barcode With Camera'}
							</button>
						</div>
						{isScanningBarcode ? (
							<div className='m-5'>
								<video
									ref={videoRef}
									className='containerDetail width--10'
									playsInline
									muted
									aria-label='Live camera preview for barcode scanning'
								/>
								<div className='mt-5 color-orange'>Point your camera at a barcode and hold still until the SKU is captured.</div>
							</div>
						) : null}
						{scannerError ? (
							<div className='m-5 color-orange' role='status' aria-live='polite'>{scannerError}</div>
						) : null}
						{lastScannedCode ? (
							<div className='m-5 color-yellow' role='status' aria-live='polite'>Captured barcode: {lastScannedCode}</div>
						) : null}
						<input
							className='containerDetail p-10 m-5 color-lite width--10'
							type='text'
							value={formState.sku}
							onChange={handleFieldChange('sku')}
							placeholder='SKU'
							aria-label='Product SKU'
							required
						/>
						<input
							className='containerDetail p-10 m-5 color-lite width--10'
							type='text'
							value={formState.name}
							onChange={handleFieldChange('name')}
							placeholder='Product name'
							aria-label='Product name'
							required
						/>
						<input
							className='containerDetail p-10 m-5 color-lite width--10'
							type='text'
							value={formState.category}
							onChange={handleFieldChange('category')}
							placeholder='Category'
							aria-label='Product category'
							required
						/>
						<input
							className='containerDetail p-10 m-5 color-lite width--10'
							type='text'
							value={formState.materialType}
							onChange={handleFieldChange('materialType')}
							placeholder='Material type'
							aria-label='Material type'
							required
						/>
						<input
							className='containerDetail p-10 m-5 color-lite width--10'
							type='text'
							value={formState.size}
							onChange={handleFieldChange('size')}
							placeholder='Size'
							aria-label='Product size'
						/>
						<input
							className='containerDetail p-10 m-5 color-lite width--10'
							type='text'
							value={formState.aisle}
							onChange={handleFieldChange('aisle')}
							placeholder='Aisle'
							aria-label='Store aisle'
						/>
						<input
							className='containerDetail p-10 m-5 color-lite width--10'
							type='text'
							value={formState.bay}
							onChange={handleFieldChange('bay')}
							placeholder='Bay'
							aria-label='Store bay'
						/>
						<input
							className='containerDetail p-10 m-5 color-lite width--10'
							type='text'
							value={formState.unit}
							onChange={handleFieldChange('unit')}
							placeholder='Unit'
							aria-label='Unit of sale'
						/>
						<select
							className='containerDetail p-10 m-5 color-lite width--10'
							value={formState.price}
							onChange={handleFieldChange('price')}
							aria-label='Price band'
						>
							{['$', '$$', '$$$', '$$$$'].map((value) => (
								<option key={value} value={value}>
									{value}
								</option>
							))}
						</select>
						<input
							className='containerDetail p-10 m-5 color-lite width--10'
							type='text'
							value={formState.uses}
							onChange={handleFieldChange('uses')}
							placeholder='Best uses, comma separated'
							aria-label='Best uses'
						/>
						<textarea
							className='containerDetail p-10 m-5 color-lite width--10'
							value={formState.notes}
							onChange={handleFieldChange('notes')}
							placeholder='Notes'
							aria-label='Product notes'
							rows={4}
						/>
						<div className='m-5'>
							<button className='containerDetail p-10 m-5 color-lite bg-tintedMedium' type='submit'>
								{editingProductId ? 'Save Product' : 'Add Product'}
							</button>
							<button
								className='containerDetail p-10 m-5 color-lite bg-lite'
								type='button'
								onClick={resetForm}
								aria-label='Clear product form'
							>
								Clear
							</button>
						</div>
					</form>
				)}
			</div>

			<div className='containerDetail bg-lite p-20 mb-5 contentLeft'>
				<span className='color-yellow'>Results:</span> {filteredProducts.length} offline products
				<div className='mt-5'>Catalog total: {products.length} products</div>
			</div>

			<div className='containerDetail'>
				{filteredProducts.map((item) => (
					<div key={item.id} className='containerDetail bg-lite mb-5 contentLeft'>
						<div className='containerDetail bg-lite pl-10 pt-20 pb-20 size20 color-yellow'>{item.name}</div>
						<div className='mt-5 containerDetail p-10'><span className='color-yellow'>SKU:</span> {item.sku}</div>
						<div className='mt-5 containerDetail p-10'><span className='color-yellow'>Category:</span> {item.category}</div>
						<div className='mt-5 containerDetail p-10'><span className='color-yellow'>Material:</span> {item.materialType}</div>
						<div className='mt-5 containerDetail p-10'><span className='color-yellow'>Size:</span> {item.size}</div>
						<div className='mt-5 containerDetail bg-green p-10 size25'><span className='color-yellow'></span> {item.aisle}, {item.bay}</div>
						<div className='mt-5 containerDetail p-10'><span className='color-yellow'>Store location:</span> {item.aisle}, {item.bay}</div>
						<div className='mt-5 containerDetail p-10'><span className='color-yellow'>Unit:</span> {item.unit}</div>
						<div className='mt-5 containerDetail p-10'><span className='color-yellow'>Price band:</span> {item.price}</div>
						<div className='mt-5 containerDetail p-10'><span className='color-yellow'>Best for:</span> {item.uses.join(', ') || 'Not listed'}</div>
						<div className='mt-5 containerDetail p-10 color-orange'>{item.notes}</div>
						<div className='mt-10'>
							<button
								className='containerDetail p-10 m-5 color-lite bg-lite'
								type='button'
								onClick={() => handleEditProduct(item)}
								aria-label={`Edit ${item.name}`}
							>
								Edit
							</button>
							<button
								className='containerDetail p-10 m-5 color-lite bg-lite'
								type='button'
								onClick={() => handleDeleteProduct(item.id)}
								aria-label={`Delete ${item.name}`}
							>
								Delete
							</button>
						</div>
					</div>
				))}
				{filteredProducts.length === 0 ? (
					<div className='containerDetail bg-lite p-20 color-orange contentLeft'>
						No offline products matched that lookup. Try a broader search like plywood, stud, fence, concrete, drywall, or insulation.
					</div>
				) : null}
			</div>
		</div>
	);
};

export default THD;
