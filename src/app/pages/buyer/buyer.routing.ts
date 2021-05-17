import { Routes, RouterModule } from '@angular/router';
import { BuyerComponent } from './buyer.component';

const routes: Routes = [
    {
        path: '',
        component: BuyerComponent,
        children: [
            {
                path: "drill",
                loadChildren: () =>
                    import("../../modules/buying-guide/drills/drills.module").then(
                        (m) => m.DrillModule
                    ),
                data: {
                    title: " Drill Machine",
                },
            },
            {
                path: "stabilizer",
                loadChildren: () =>
                    import("../../modules/buying-guide/stablizer/stablizer.module").then(
                        (m) => m.StablizerModule
                    ),
                data: {
                    title: "Stabilizers",
                },
            },
            {
                path: "diagnostic",
                loadChildren: () =>
                    import("../../modules/buying-guide/diagnistic/diagnostic.module").then(
                        (m) => m.DiagnosticModule
                    ),
                data: {
                    title: "Diagnostic Instruments",
                },
            },
            {
                path: "hand-tools",
                loadChildren: () =>
                    import("../../modules/buying-guide/hand-tools/hand.module").then(
                        (m) => m.HandModule
                    ),
                data: {
                    title: "Hand Tools",
                },
            },
            {
                path: "fan",
                loadChildren: () =>
                    import("../../modules/buying-guide/celling/celling.module").then(
                        (m) => m.CellingModule
                    ),
                data: {
                    title: "Fans",
                },
            },
            {
                path: "wire",
                loadChildren: () =>
                    import("../../modules/buying-guide/wires/wire.module").then(
                        (m) => m.WireModule
                    ),
                data: {
                    title: " Wires and cables",
                },
            },
            {
                path: "cctv",
                loadChildren: () =>
                    import("../../modules/buying-guide/cctv/cctv.module").then(
                        (m) => m.CctvModule
                    ),
                data: {
                    title: "CCTV",
                },
            },
            {
                path: "gardening",
                loadChildren: () =>
                    import("../../modules/buying-guide/gardening/gardening.module").then(
                        (m) => m.GardenModule
                    ),
                data: {
                    title: "Gardening Tools",
                },
            },
            {
                path: "respiratory",
                loadChildren: () =>
                    import("../../modules/buying-guide/respiratory/respiratory.module").then(
                        (m) => m.RespiratoryModule
                    ),
                data: {
                    title: "Respiratory Masks",
                },
            },
            {
                path: "battern",
                loadChildren: () =>
                    import("../../modules/buying-guide/led-battern/led-battern.module").then(
                        (m) => m.BatternModule
                    ),
                data: {
                    title: " LED Batten Lights",
                },
            },
            {
                path: "angle",
                loadChildren: () =>
                    import("../../modules/buying-guide/angle/angle.module").then(
                        (m) => m.AngleModule
                    ),
                data: {
                    title: "Angle Grinders",
                },
            },
            {
                path: "flood",
                loadChildren: () =>
                    import("../../modules/buying-guide/flood/flood.module").then(
                        (m) => m.FloodModule
                    ),
                data: {
                    title: "Flood Lights ",
                },
            },
            {
                path: "office",
                loadChildren: () =>
                    import("../../modules/buying-guide/office/office.module").then(
                        (m) => m.OfficeModule
                    ),
                data: {
                    title: "Office Supplies ",
                },
            },
            {
                path: "safety-shoe",
                loadChildren: () =>
                    import("../../modules/buying-guide/shoe/shoe.module").then(
                        (m) => m.ShoeModule
                    ),
                data: {
                    title: "safety shoes ",
                },
            },
            {
                path: "geysers",
                loadChildren: () =>
                    import("../../modules/buying-guide/geaser/geaser.module").then(
                        (m) => m.GeaserModule
                    ),
                data: {
                    title: "geysers",
                },
            },
            {
                path: "power-tools",
                loadChildren: () =>
                    import("../../modules/buying-guide/power-tools/power-tools.module").then(
                        (m) => m.PowerToolsModule
                    ),
                data: {
                    title: "power tools ",
                },
            },
            {
                path: "plumbing",
                loadChildren: () =>
                    import("../../modules/buying-guide/plumbing/plumbing.module").then(
                        (m) => m.PlumbingModule
                    ),
                data: {
                    title: "plumbing",
                },
            },
            {
                path: "printers",
                loadChildren: () =>
                    import("../../modules/buying-guide/printer/printer.module").then(
                        (m) => m.PrinterModule
                    ),
                data: {
                    title: " printers",
                },
            },
            {
                path: "power",
                loadChildren: () =>
                    import("../../modules/buying-guide/power/power.module").then(
                        (m) => m.PowerModule
                    ),
                data: {
                    title: "power Generation",
                },
            },
            {
                path: "inverter",
                loadChildren: () =>
                    import("../../modules/buying-guide/inverter/inverter.module").then(
                        (m) => m.InverterModule
                    ),
                data: {
                    title: "inverter",
                },
            },
            {
                path: "led",
                loadChildren: () =>
                    import("../../modules/buying-guide/led/led.module").then(
                        (m) => m.LedModule
                    ),
                data: {
                    title: "led ",
                },
            },
            {
                path: "polisher",
                loadChildren: () =>
                    import("../../modules/buying-guide/polisher/polisher.module").then(
                        (m) => m.PolisherModule
                    ),
                data: {
                    title: " Sanders and Polishers",
                },
            },
            {
                path: "safety",
                loadChildren: () =>
                    import("../../modules/buying-guide/safety/safety.module").then(
                        (m) => m.SafetyModule
                    ),
                data: {
                    title: "safety",
                },
            },
            {
                path: "safety-helmet",
                loadChildren: () =>
                    import("../../modules/buying-guide/safety-helmet/safety.module").then(
                        (m) => m.SafetyHelmetModule
                    ),
                data: {
                    title: "safety helmet",
                },
            },
        ]
    }
];

export const routing = RouterModule.forChild(routes);