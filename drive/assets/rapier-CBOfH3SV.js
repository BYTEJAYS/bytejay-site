import { B as Vt, __tla as __tla_0 } from "./index-lAT8tYsS.js";
let At, xt, Et, Ce, kr, Dr, Ee, Vr, wt, pe, P, Yr, gt, ke, Ct, Ie, De, Br, qr, Jr, Ed, st, Rr, jr, Er, Wr, _e, Me, q, Pr, Sr, Hr, oe, U, H, Ur, tt, ae, $, Mr, Lr, Gr, he, Xr, ht, pt, Fe, Ir, Fr, ie, ce, Or, xd, Ht, dt, ut, xr, zr, se, V, yr, O, vr, y, Le, It, xe, He, je, mr, ne, Ae, we, T, at, nt, j, de, Ar, Tr, Cr, Kr, Nr, Te, le, Pe, Re, ve, fr, c, ze, kt, Fd, Pd, Ad;
let __tla = Promise.all([
    (()=>{
        try {
            return __tla_0;
        } catch  {}
    })()
]).then(async ()=>{
    const Zr = "" + new URL("rapier_wasm3d_bg-0Vyjx73g.wasm", import.meta.url).href, $r = async (s = {}, t)=>{
        let e;
        if (t.startsWith("data:")) {
            const r = t.replace(/^data:.*?base64,/, "");
            let n;
            if (typeof Vt == "function" && typeof Vt.from == "function") n = Vt.from(r, "base64");
            else if (typeof atob == "function") {
                const a = atob(r);
                n = new Uint8Array(a.length);
                for(let o = 0; o < a.length; o++)n[o] = a.charCodeAt(o);
            } else throw new Error("Cannot decode base64-encoded data URL");
            e = await WebAssembly.instantiate(n, s);
        } else {
            const r = await fetch(t), n = r.headers.get("Content-Type") || "";
            if ("instantiateStreaming" in WebAssembly && n.startsWith("application/wasm")) e = await WebAssembly.instantiateStreaming(r, s);
            else {
                const a = await r.arrayBuffer();
                e = await WebAssembly.instantiate(a, s);
            }
        }
        return e.instance.exports;
    };
    let i;
    function Qr(s) {
        i = s;
    }
    const R = new Array(128).fill(void 0);
    R.push(void 0, null, !0, !1);
    function v(s) {
        return R[s];
    }
    let _t = R.length;
    function z(s) {
        _t === R.length && R.push(R.length + 1);
        const t = _t;
        return _t = R[t], R[t] = s, t;
    }
    function ue(s, t) {
        try {
            return s.apply(this, t);
        } catch (e) {
            i.__wbindgen_export_0(z(e));
        }
    }
    function f(s) {
        return s == null;
    }
    let it = null;
    function F() {
        return (it === null || it.buffer.detached === !0 || it.buffer.detached === void 0 && it.buffer !== i.memory.buffer) && (it = new DataView(i.memory.buffer)), it;
    }
    function ti(s) {
        s < 132 || (R[s] = _t, _t = s);
    }
    function lt(s) {
        const t = v(s);
        return ti(s), t;
    }
    const ei = typeof TextDecoder > "u" ? (0, module.require)("util").TextDecoder : TextDecoder;
    let hr = new ei("utf-8", {
        ignoreBOM: !0,
        fatal: !0
    });
    hr.decode();
    let ft = null;
    function ri() {
        return (ft === null || ft.byteLength === 0) && (ft = new Uint8Array(i.memory.buffer)), ft;
    }
    function dr(s, t) {
        return s = s >>> 0, hr.decode(ri().subarray(s, s + t));
    }
    function ii() {
        let s, t;
        try {
            const n = i.__wbindgen_add_to_stack_pointer(-16);
            i.version(n);
            var e = F().getInt32(n + 0, !0), r = F().getInt32(n + 4, !0);
            return s = e, t = r, dr(e, r);
        } finally{
            i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export_1(s, t, 1);
        }
    }
    function ni(s) {
        i.reserve_memory(s);
    }
    function _(s, t) {
        if (!(s instanceof t)) throw new Error(`expected instance of ${t.name}`);
    }
    let C = 128;
    function x(s) {
        if (C == 1) throw new Error("out of js stack");
        return R[--C] = s, C;
    }
    let mt = null;
    function si() {
        return (mt === null || mt.byteLength === 0) && (mt = new Int32Array(i.memory.buffer)), mt;
    }
    function ai(s, t) {
        return s = s >>> 0, si().subarray(s / 4, s / 4 + t);
    }
    let yt = null;
    function pr() {
        return (yt === null || yt.byteLength === 0) && (yt = new Float32Array(i.memory.buffer)), yt;
    }
    function We(s, t) {
        return s = s >>> 0, pr().subarray(s / 4, s / 4 + t);
    }
    let St = null;
    function ur() {
        return (St === null || St.byteLength === 0) && (St = new Uint32Array(i.memory.buffer)), St;
    }
    function oi(s, t) {
        return s = s >>> 0, ur().subarray(s / 4, s / 4 + t);
    }
    let L = 0;
    function ot(s, t) {
        const e = t(s.length * 4, 4) >>> 0;
        return ur().set(s, e / 4), L = s.length, e;
    }
    function Y(s, t) {
        const e = t(s.length * 4, 4) >>> 0;
        return pr().set(s, e / 4), L = s.length, e;
    }
    const Pt = Object.freeze({
        LinX: 0,
        0: "LinX",
        LinY: 1,
        1: "LinY",
        LinZ: 2,
        2: "LinZ",
        AngX: 3,
        3: "AngX",
        AngY: 4,
        4: "AngY",
        AngZ: 5,
        5: "AngZ"
    }), B = Object.freeze({
        Revolute: 0,
        0: "Revolute",
        Fixed: 1,
        1: "Fixed",
        Prismatic: 2,
        2: "Prismatic",
        Rope: 3,
        3: "Rope",
        Spring: 4,
        4: "Spring",
        Spherical: 5,
        5: "Spherical",
        Generic: 6,
        6: "Generic"
    }), M = Object.freeze({
        Ball: 0,
        0: "Ball",
        Cuboid: 1,
        1: "Cuboid",
        Capsule: 2,
        2: "Capsule",
        Segment: 3,
        3: "Segment",
        Polyline: 4,
        4: "Polyline",
        Triangle: 5,
        5: "Triangle",
        TriMesh: 6,
        6: "TriMesh",
        HeightField: 7,
        7: "HeightField",
        Compound: 8,
        8: "Compound",
        ConvexPolyhedron: 9,
        9: "ConvexPolyhedron",
        Cylinder: 10,
        10: "Cylinder",
        Cone: 11,
        11: "Cone",
        RoundCuboid: 12,
        12: "RoundCuboid",
        RoundTriangle: 13,
        13: "RoundTriangle",
        RoundCylinder: 14,
        14: "RoundCylinder",
        RoundCone: 15,
        15: "RoundCone",
        RoundConvexPolyhedron: 16,
        16: "RoundConvexPolyhedron",
        HalfSpace: 17,
        17: "HalfSpace",
        Voxels: 18,
        18: "Voxels"
    }), Ut = typeof FinalizationRegistry > "u" ? {
        register: ()=>{},
        unregister: ()=>{}
    } : new FinalizationRegistry((s)=>i.__wbg_rawbroadphase_free(s >>> 0, 1));
    class et {
        static __wrap(t) {
            t = t >>> 0;
            const e = Object.create(et.prototype);
            return e.__wbg_ptr = t, Ut.register(e, e.__wbg_ptr, e), e;
        }
        __destroy_into_raw() {
            const t = this.__wbg_ptr;
            return this.__wbg_ptr = 0, Ut.unregister(this), t;
        }
        free() {
            const t = this.__destroy_into_raw();
            i.__wbg_rawbroadphase_free(t, 0);
        }
        constructor(){
            const t = i.rawbroadphase_new();
            return this.__wbg_ptr = t >>> 0, Ut.register(this, this.__wbg_ptr, this), this;
        }
    }
    const Ge = typeof FinalizationRegistry > "u" ? {
        register: ()=>{},
        unregister: ()=>{}
    } : new FinalizationRegistry((s)=>i.__wbg_rawccdsolver_free(s >>> 0, 1));
    class re {
        __destroy_into_raw() {
            const t = this.__wbg_ptr;
            return this.__wbg_ptr = 0, Ge.unregister(this), t;
        }
        free() {
            const t = this.__destroy_into_raw();
            i.__wbg_rawccdsolver_free(t, 0);
        }
        constructor(){
            const t = i.rawccdsolver_new();
            return this.__wbg_ptr = t >>> 0, Ge.register(this, this.__wbg_ptr, this), this;
        }
    }
    const Oe = typeof FinalizationRegistry > "u" ? {
        register: ()=>{},
        unregister: ()=>{}
    } : new FinalizationRegistry((s)=>i.__wbg_rawcharactercollision_free(s >>> 0, 1));
    class gr {
        __destroy_into_raw() {
            const t = this.__wbg_ptr;
            return this.__wbg_ptr = 0, Oe.unregister(this), t;
        }
        free() {
            const t = this.__destroy_into_raw();
            i.__wbg_rawcharactercollision_free(t, 0);
        }
        constructor(){
            const t = i.rawcharactercollision_new();
            return this.__wbg_ptr = t >>> 0, Oe.register(this, this.__wbg_ptr, this), this;
        }
        handle() {
            return i.rawcharactercollision_handle(this.__wbg_ptr);
        }
        translationDeltaApplied() {
            const t = i.rawcharactercollision_translationDeltaApplied(this.__wbg_ptr);
            return l.__wrap(t);
        }
        translationDeltaRemaining() {
            const t = i.rawcharactercollision_translationDeltaRemaining(this.__wbg_ptr);
            return l.__wrap(t);
        }
        toi() {
            return i.rawcharactercollision_toi(this.__wbg_ptr);
        }
        worldWitness1() {
            const t = i.rawcharactercollision_worldWitness1(this.__wbg_ptr);
            return l.__wrap(t);
        }
        worldWitness2() {
            const t = i.rawcharactercollision_worldWitness2(this.__wbg_ptr);
            return l.__wrap(t);
        }
        worldNormal1() {
            const t = i.rawcharactercollision_worldNormal1(this.__wbg_ptr);
            return l.__wrap(t);
        }
        worldNormal2() {
            const t = i.rawcharactercollision_worldNormal2(this.__wbg_ptr);
            return l.__wrap(t);
        }
    }
    const Xt = typeof FinalizationRegistry > "u" ? {
        register: ()=>{},
        unregister: ()=>{}
    } : new FinalizationRegistry((s)=>i.__wbg_rawcolliderset_free(s >>> 0, 1));
    class A {
        static __wrap(t) {
            t = t >>> 0;
            const e = Object.create(A.prototype);
            return e.__wbg_ptr = t, Xt.register(e, e.__wbg_ptr, e), e;
        }
        __destroy_into_raw() {
            const t = this.__wbg_ptr;
            return this.__wbg_ptr = 0, Xt.unregister(this), t;
        }
        free() {
            const t = this.__destroy_into_raw();
            i.__wbg_rawcolliderset_free(t, 0);
        }
        coTranslation(t) {
            const e = i.rawcolliderset_coTranslation(this.__wbg_ptr, t);
            return l.__wrap(e);
        }
        coRotation(t) {
            const e = i.rawcolliderset_coRotation(this.__wbg_ptr, t);
            return S.__wrap(e);
        }
        coSetTranslation(t, e, r, n) {
            i.rawcolliderset_coSetTranslation(this.__wbg_ptr, t, e, r, n);
        }
        coSetTranslationWrtParent(t, e, r, n) {
            i.rawcolliderset_coSetTranslationWrtParent(this.__wbg_ptr, t, e, r, n);
        }
        coSetRotation(t, e, r, n, a) {
            i.rawcolliderset_coSetRotation(this.__wbg_ptr, t, e, r, n, a);
        }
        coSetRotationWrtParent(t, e, r, n, a) {
            i.rawcolliderset_coSetRotationWrtParent(this.__wbg_ptr, t, e, r, n, a);
        }
        coIsSensor(t) {
            return i.rawcolliderset_coIsSensor(this.__wbg_ptr, t) !== 0;
        }
        coShapeType(t) {
            return i.rawcolliderset_coShapeType(this.__wbg_ptr, t);
        }
        coHalfspaceNormal(t) {
            const e = i.rawcolliderset_coHalfspaceNormal(this.__wbg_ptr, t);
            return e === 0 ? void 0 : l.__wrap(e);
        }
        coHalfExtents(t) {
            const e = i.rawcolliderset_coHalfExtents(this.__wbg_ptr, t);
            return e === 0 ? void 0 : l.__wrap(e);
        }
        coSetHalfExtents(t, e) {
            _(e, l), i.rawcolliderset_coSetHalfExtents(this.__wbg_ptr, t, e.__wbg_ptr);
        }
        coRadius(t) {
            const e = i.rawcolliderset_coRadius(this.__wbg_ptr, t);
            return e === 4294967297 ? void 0 : e;
        }
        coSetRadius(t, e) {
            i.rawcolliderset_coSetRadius(this.__wbg_ptr, t, e);
        }
        coHalfHeight(t) {
            const e = i.rawcolliderset_coHalfHeight(this.__wbg_ptr, t);
            return e === 4294967297 ? void 0 : e;
        }
        coSetHalfHeight(t, e) {
            i.rawcolliderset_coSetHalfHeight(this.__wbg_ptr, t, e);
        }
        coRoundRadius(t) {
            const e = i.rawcolliderset_coRoundRadius(this.__wbg_ptr, t);
            return e === 4294967297 ? void 0 : e;
        }
        coSetRoundRadius(t, e) {
            i.rawcolliderset_coSetRoundRadius(this.__wbg_ptr, t, e);
        }
        coVoxelData(t) {
            try {
                const n = i.__wbindgen_add_to_stack_pointer(-16);
                i.rawcolliderset_coVoxelData(n, this.__wbg_ptr, t);
                var e = F().getInt32(n + 0, !0), r = F().getInt32(n + 4, !0);
                let a;
                return e !== 0 && (a = ai(e, r).slice(), i.__wbindgen_export_1(e, r * 4, 4)), a;
            } finally{
                i.__wbindgen_add_to_stack_pointer(16);
            }
        }
        coVoxelSize(t) {
            const e = i.rawcolliderset_coVoxelSize(this.__wbg_ptr, t);
            return e === 0 ? void 0 : l.__wrap(e);
        }
        coSetVoxel(t, e, r, n, a) {
            i.rawcolliderset_coSetVoxel(this.__wbg_ptr, t, e, r, n, a);
        }
        coPropagateVoxelChange(t, e, r, n, a, o, w, h) {
            i.rawcolliderset_coPropagateVoxelChange(this.__wbg_ptr, t, e, r, n, a, o, w, h);
        }
        coCombineVoxelStates(t, e, r, n, a) {
            i.rawcolliderset_coCombineVoxelStates(this.__wbg_ptr, t, e, r, n, a);
        }
        coVertices(t) {
            try {
                const n = i.__wbindgen_add_to_stack_pointer(-16);
                i.rawcolliderset_coVertices(n, this.__wbg_ptr, t);
                var e = F().getInt32(n + 0, !0), r = F().getInt32(n + 4, !0);
                let a;
                return e !== 0 && (a = We(e, r).slice(), i.__wbindgen_export_1(e, r * 4, 4)), a;
            } finally{
                i.__wbindgen_add_to_stack_pointer(16);
            }
        }
        coIndices(t) {
            try {
                const n = i.__wbindgen_add_to_stack_pointer(-16);
                i.rawcolliderset_coIndices(n, this.__wbg_ptr, t);
                var e = F().getInt32(n + 0, !0), r = F().getInt32(n + 4, !0);
                let a;
                return e !== 0 && (a = oi(e, r).slice(), i.__wbindgen_export_1(e, r * 4, 4)), a;
            } finally{
                i.__wbindgen_add_to_stack_pointer(16);
            }
        }
        coTriMeshFlags(t) {
            const e = i.rawcolliderset_coTriMeshFlags(this.__wbg_ptr, t);
            return e === 4294967297 ? void 0 : e;
        }
        coHeightFieldFlags(t) {
            const e = i.rawcolliderset_coHeightFieldFlags(this.__wbg_ptr, t);
            return e === 4294967297 ? void 0 : e;
        }
        coHeightfieldHeights(t) {
            try {
                const n = i.__wbindgen_add_to_stack_pointer(-16);
                i.rawcolliderset_coHeightfieldHeights(n, this.__wbg_ptr, t);
                var e = F().getInt32(n + 0, !0), r = F().getInt32(n + 4, !0);
                let a;
                return e !== 0 && (a = We(e, r).slice(), i.__wbindgen_export_1(e, r * 4, 4)), a;
            } finally{
                i.__wbindgen_add_to_stack_pointer(16);
            }
        }
        coHeightfieldScale(t) {
            const e = i.rawcolliderset_coHeightfieldScale(this.__wbg_ptr, t);
            return e === 0 ? void 0 : l.__wrap(e);
        }
        coHeightfieldNRows(t) {
            const e = i.rawcolliderset_coHeightfieldNRows(this.__wbg_ptr, t);
            return e === 4294967297 ? void 0 : e;
        }
        coHeightfieldNCols(t) {
            const e = i.rawcolliderset_coHeightfieldNCols(this.__wbg_ptr, t);
            return e === 4294967297 ? void 0 : e;
        }
        coParent(t) {
            try {
                const n = i.__wbindgen_add_to_stack_pointer(-16);
                i.rawcolliderset_coParent(n, this.__wbg_ptr, t);
                var e = F().getInt32(n + 0, !0), r = F().getFloat64(n + 8, !0);
                return e === 0 ? void 0 : r;
            } finally{
                i.__wbindgen_add_to_stack_pointer(16);
            }
        }
        coSetEnabled(t, e) {
            i.rawcolliderset_coSetEnabled(this.__wbg_ptr, t, e);
        }
        coIsEnabled(t) {
            return i.rawcolliderset_coIsEnabled(this.__wbg_ptr, t) !== 0;
        }
        coSetContactSkin(t, e) {
            i.rawcolliderset_coSetContactSkin(this.__wbg_ptr, t, e);
        }
        coContactSkin(t) {
            return i.rawcolliderset_coContactSkin(this.__wbg_ptr, t);
        }
        coFriction(t) {
            return i.rawcolliderset_coFriction(this.__wbg_ptr, t);
        }
        coRestitution(t) {
            return i.rawcolliderset_coRestitution(this.__wbg_ptr, t);
        }
        coDensity(t) {
            return i.rawcolliderset_coDensity(this.__wbg_ptr, t);
        }
        coMass(t) {
            return i.rawcolliderset_coMass(this.__wbg_ptr, t);
        }
        coVolume(t) {
            return i.rawcolliderset_coVolume(this.__wbg_ptr, t);
        }
        coCollisionGroups(t) {
            return i.rawcolliderset_coCollisionGroups(this.__wbg_ptr, t) >>> 0;
        }
        coSolverGroups(t) {
            return i.rawcolliderset_coSolverGroups(this.__wbg_ptr, t) >>> 0;
        }
        coActiveHooks(t) {
            return i.rawcolliderset_coActiveHooks(this.__wbg_ptr, t) >>> 0;
        }
        coActiveCollisionTypes(t) {
            return i.rawcolliderset_coActiveCollisionTypes(this.__wbg_ptr, t);
        }
        coActiveEvents(t) {
            return i.rawcolliderset_coActiveEvents(this.__wbg_ptr, t) >>> 0;
        }
        coContactForceEventThreshold(t) {
            return i.rawcolliderset_coContactForceEventThreshold(this.__wbg_ptr, t);
        }
        coContainsPoint(t, e) {
            return _(e, l), i.rawcolliderset_coContainsPoint(this.__wbg_ptr, t, e.__wbg_ptr) !== 0;
        }
        coCastShape(t, e, r, n, a, o, w, h, d) {
            _(e, l), _(r, b), _(n, l), _(a, S), _(o, l);
            const p = i.rawcolliderset_coCastShape(this.__wbg_ptr, t, e.__wbg_ptr, r.__wbg_ptr, n.__wbg_ptr, a.__wbg_ptr, o.__wbg_ptr, w, h, d);
            return p === 0 ? void 0 : Mt.__wrap(p);
        }
        coCastCollider(t, e, r, n, a, o, w) {
            _(e, l), _(n, l);
            const h = i.rawcolliderset_coCastCollider(this.__wbg_ptr, t, e.__wbg_ptr, r, n.__wbg_ptr, a, o, w);
            return h === 0 ? void 0 : jt.__wrap(h);
        }
        coIntersectsShape(t, e, r, n) {
            return _(e, b), _(r, l), _(n, S), i.rawcolliderset_coIntersectsShape(this.__wbg_ptr, t, e.__wbg_ptr, r.__wbg_ptr, n.__wbg_ptr) !== 0;
        }
        coContactShape(t, e, r, n, a) {
            _(e, b), _(r, l), _(n, S);
            const o = i.rawcolliderset_coContactShape(this.__wbg_ptr, t, e.__wbg_ptr, r.__wbg_ptr, n.__wbg_ptr, a);
            return o === 0 ? void 0 : ct.__wrap(o);
        }
        coContactCollider(t, e, r) {
            const n = i.rawcolliderset_coContactCollider(this.__wbg_ptr, t, e, r);
            return n === 0 ? void 0 : ct.__wrap(n);
        }
        coProjectPoint(t, e, r) {
            _(e, l);
            const n = i.rawcolliderset_coProjectPoint(this.__wbg_ptr, t, e.__wbg_ptr, r);
            return Ft.__wrap(n);
        }
        coIntersectsRay(t, e, r, n) {
            return _(e, l), _(r, l), i.rawcolliderset_coIntersectsRay(this.__wbg_ptr, t, e.__wbg_ptr, r.__wbg_ptr, n) !== 0;
        }
        coCastRay(t, e, r, n, a) {
            return _(e, l), _(r, l), i.rawcolliderset_coCastRay(this.__wbg_ptr, t, e.__wbg_ptr, r.__wbg_ptr, n, a);
        }
        coCastRayAndGetNormal(t, e, r, n, a) {
            _(e, l), _(r, l);
            const o = i.rawcolliderset_coCastRayAndGetNormal(this.__wbg_ptr, t, e.__wbg_ptr, r.__wbg_ptr, n, a);
            return o === 0 ? void 0 : Tt.__wrap(o);
        }
        coSetSensor(t, e) {
            i.rawcolliderset_coSetSensor(this.__wbg_ptr, t, e);
        }
        coSetRestitution(t, e) {
            i.rawcolliderset_coSetRestitution(this.__wbg_ptr, t, e);
        }
        coSetFriction(t, e) {
            i.rawcolliderset_coSetFriction(this.__wbg_ptr, t, e);
        }
        coFrictionCombineRule(t) {
            return i.rawcolliderset_coFrictionCombineRule(this.__wbg_ptr, t) >>> 0;
        }
        coSetFrictionCombineRule(t, e) {
            i.rawcolliderset_coSetFrictionCombineRule(this.__wbg_ptr, t, e);
        }
        coRestitutionCombineRule(t) {
            return i.rawcolliderset_coRestitutionCombineRule(this.__wbg_ptr, t) >>> 0;
        }
        coSetRestitutionCombineRule(t, e) {
            i.rawcolliderset_coSetRestitutionCombineRule(this.__wbg_ptr, t, e);
        }
        coSetCollisionGroups(t, e) {
            i.rawcolliderset_coSetCollisionGroups(this.__wbg_ptr, t, e);
        }
        coSetSolverGroups(t, e) {
            i.rawcolliderset_coSetSolverGroups(this.__wbg_ptr, t, e);
        }
        coSetActiveHooks(t, e) {
            i.rawcolliderset_coSetActiveHooks(this.__wbg_ptr, t, e);
        }
        coSetActiveEvents(t, e) {
            i.rawcolliderset_coSetActiveEvents(this.__wbg_ptr, t, e);
        }
        coSetActiveCollisionTypes(t, e) {
            i.rawcolliderset_coSetActiveCollisionTypes(this.__wbg_ptr, t, e);
        }
        coSetShape(t, e) {
            _(e, b), i.rawcolliderset_coSetShape(this.__wbg_ptr, t, e.__wbg_ptr);
        }
        coSetContactForceEventThreshold(t, e) {
            i.rawcolliderset_coSetContactForceEventThreshold(this.__wbg_ptr, t, e);
        }
        coSetDensity(t, e) {
            i.rawcolliderset_coSetDensity(this.__wbg_ptr, t, e);
        }
        coSetMass(t, e) {
            i.rawcolliderset_coSetMass(this.__wbg_ptr, t, e);
        }
        coSetMassProperties(t, e, r, n, a) {
            _(r, l), _(n, l), _(a, S), i.rawcolliderset_coSetMassProperties(this.__wbg_ptr, t, e, r.__wbg_ptr, n.__wbg_ptr, a.__wbg_ptr);
        }
        constructor(){
            const t = i.rawcolliderset_new();
            return this.__wbg_ptr = t >>> 0, Xt.register(this, this.__wbg_ptr, this), this;
        }
        len() {
            return i.rawcolliderset_len(this.__wbg_ptr) >>> 0;
        }
        contains(t) {
            return i.rawcolliderset_contains(this.__wbg_ptr, t) !== 0;
        }
        createCollider(t, e, r, n, a, o, w, h, d, p, u, g, m, I, k, N, W, G, Q, Lt, Nt, Wt, Gt, Ot, bt) {
            try {
                const qt = i.__wbindgen_add_to_stack_pointer(-16);
                _(e, b), _(r, l), _(n, S), _(w, l), _(h, l), _(d, S), _(bt, E), i.rawcolliderset_createCollider(qt, this.__wbg_ptr, t, e.__wbg_ptr, r.__wbg_ptr, n.__wbg_ptr, a, o, w.__wbg_ptr, h.__wbg_ptr, d.__wbg_ptr, p, u, g, m, I, k, N, W, G, Q, Lt, Nt, Wt, Gt, Ot, bt.__wbg_ptr);
                var Bt = F().getInt32(qt + 0, !0), Ne = F().getFloat64(qt + 8, !0);
                return Bt === 0 ? void 0 : Ne;
            } finally{
                i.__wbindgen_add_to_stack_pointer(16);
            }
        }
        remove(t, e, r, n) {
            _(e, J), _(r, E), i.rawcolliderset_remove(this.__wbg_ptr, t, e.__wbg_ptr, r.__wbg_ptr, n);
        }
        isHandleValid(t) {
            return i.rawcolliderset_contains(this.__wbg_ptr, t) !== 0;
        }
        forEachColliderHandle(t) {
            try {
                i.rawcolliderset_forEachColliderHandle(this.__wbg_ptr, x(t));
            } finally{
                R[C++] = void 0;
            }
        }
    }
    const Be = typeof FinalizationRegistry > "u" ? {
        register: ()=>{},
        unregister: ()=>{}
    } : new FinalizationRegistry((s)=>i.__wbg_rawcollidershapecasthit_free(s >>> 0, 1));
    class jt {
        static __wrap(t) {
            t = t >>> 0;
            const e = Object.create(jt.prototype);
            return e.__wbg_ptr = t, Be.register(e, e.__wbg_ptr, e), e;
        }
        __destroy_into_raw() {
            const t = this.__wbg_ptr;
            return this.__wbg_ptr = 0, Be.unregister(this), t;
        }
        free() {
            const t = this.__destroy_into_raw();
            i.__wbg_rawcollidershapecasthit_free(t, 0);
        }
        colliderHandle() {
            return i.rawcharactercollision_handle(this.__wbg_ptr);
        }
        time_of_impact() {
            return i.rawcollidershapecasthit_time_of_impact(this.__wbg_ptr);
        }
        witness1() {
            const t = i.rawcollidershapecasthit_witness1(this.__wbg_ptr);
            return l.__wrap(t);
        }
        witness2() {
            const t = i.rawcollidershapecasthit_witness2(this.__wbg_ptr);
            return l.__wrap(t);
        }
        normal1() {
            const t = i.rawcharactercollision_translationDeltaApplied(this.__wbg_ptr);
            return l.__wrap(t);
        }
        normal2() {
            const t = i.rawcharactercollision_translationDeltaRemaining(this.__wbg_ptr);
            return l.__wrap(t);
        }
    }
    const qe = typeof FinalizationRegistry > "u" ? {
        register: ()=>{},
        unregister: ()=>{}
    } : new FinalizationRegistry((s)=>i.__wbg_rawcontactforceevent_free(s >>> 0, 1));
    class ge {
        static __wrap(t) {
            t = t >>> 0;
            const e = Object.create(ge.prototype);
            return e.__wbg_ptr = t, qe.register(e, e.__wbg_ptr, e), e;
        }
        __destroy_into_raw() {
            const t = this.__wbg_ptr;
            return this.__wbg_ptr = 0, qe.unregister(this), t;
        }
        free() {
            const t = this.__destroy_into_raw();
            i.__wbg_rawcontactforceevent_free(t, 0);
        }
        collider1() {
            return i.rawcharactercollision_handle(this.__wbg_ptr);
        }
        collider2() {
            return i.rawcontactforceevent_collider2(this.__wbg_ptr);
        }
        total_force() {
            const t = i.rawcontactforceevent_total_force(this.__wbg_ptr);
            return l.__wrap(t);
        }
        total_force_magnitude() {
            return i.rawcontactforceevent_total_force_magnitude(this.__wbg_ptr);
        }
        max_force_direction() {
            const t = i.rawcontactforceevent_max_force_direction(this.__wbg_ptr);
            return l.__wrap(t);
        }
        max_force_magnitude() {
            return i.rawcontactforceevent_max_force_magnitude(this.__wbg_ptr);
        }
    }
    const Ve = typeof FinalizationRegistry > "u" ? {
        register: ()=>{},
        unregister: ()=>{}
    } : new FinalizationRegistry((s)=>i.__wbg_rawcontactmanifold_free(s >>> 0, 1));
    class be {
        static __wrap(t) {
            t = t >>> 0;
            const e = Object.create(be.prototype);
            return e.__wbg_ptr = t, Ve.register(e, e.__wbg_ptr, e), e;
        }
        __destroy_into_raw() {
            const t = this.__wbg_ptr;
            return this.__wbg_ptr = 0, Ve.unregister(this), t;
        }
        free() {
            const t = this.__destroy_into_raw();
            i.__wbg_rawcontactmanifold_free(t, 0);
        }
        normal() {
            const t = i.rawcontactmanifold_normal(this.__wbg_ptr);
            return l.__wrap(t);
        }
        local_n1() {
            const t = i.rawcontactmanifold_local_n1(this.__wbg_ptr);
            return l.__wrap(t);
        }
        local_n2() {
            const t = i.rawcontactmanifold_local_n2(this.__wbg_ptr);
            return l.__wrap(t);
        }
        subshape1() {
            return i.rawcontactmanifold_subshape1(this.__wbg_ptr) >>> 0;
        }
        subshape2() {
            return i.rawcontactmanifold_subshape2(this.__wbg_ptr) >>> 0;
        }
        num_contacts() {
            return i.rawcontactmanifold_num_contacts(this.__wbg_ptr) >>> 0;
        }
        contact_local_p1(t) {
            const e = i.rawcontactmanifold_contact_local_p1(this.__wbg_ptr, t);
            return e === 0 ? void 0 : l.__wrap(e);
        }
        contact_local_p2(t) {
            const e = i.rawcontactmanifold_contact_local_p2(this.__wbg_ptr, t);
            return e === 0 ? void 0 : l.__wrap(e);
        }
        contact_dist(t) {
            return i.rawcontactmanifold_contact_dist(this.__wbg_ptr, t);
        }
        contact_fid1(t) {
            return i.rawcontactmanifold_contact_fid1(this.__wbg_ptr, t) >>> 0;
        }
        contact_fid2(t) {
            return i.rawcontactmanifold_contact_fid2(this.__wbg_ptr, t) >>> 0;
        }
        contact_impulse(t) {
            return i.rawcontactmanifold_contact_impulse(this.__wbg_ptr, t);
        }
        contact_tangent_impulse_x(t) {
            return i.rawcontactmanifold_contact_tangent_impulse_x(this.__wbg_ptr, t);
        }
        contact_tangent_impulse_y(t) {
            return i.rawcontactmanifold_contact_tangent_impulse_y(this.__wbg_ptr, t);
        }
        num_solver_contacts() {
            return i.rawcontactmanifold_num_solver_contacts(this.__wbg_ptr) >>> 0;
        }
        solver_contact_point(t) {
            const e = i.rawcontactmanifold_solver_contact_point(this.__wbg_ptr, t);
            return e === 0 ? void 0 : l.__wrap(e);
        }
        solver_contact_dist(t) {
            return i.rawcontactmanifold_solver_contact_dist(this.__wbg_ptr, t);
        }
        solver_contact_friction(t) {
            return i.rawcontactmanifold_solver_contact_friction(this.__wbg_ptr, t);
        }
        solver_contact_restitution(t) {
            return i.rawcontactmanifold_solver_contact_restitution(this.__wbg_ptr, t);
        }
        solver_contact_tangent_velocity(t) {
            const e = i.rawcontactmanifold_solver_contact_tangent_velocity(this.__wbg_ptr, t);
            return l.__wrap(e);
        }
    }
    const Ue = typeof FinalizationRegistry > "u" ? {
        register: ()=>{},
        unregister: ()=>{}
    } : new FinalizationRegistry((s)=>i.__wbg_rawcontactpair_free(s >>> 0, 1));
    class fe {
        static __wrap(t) {
            t = t >>> 0;
            const e = Object.create(fe.prototype);
            return e.__wbg_ptr = t, Ue.register(e, e.__wbg_ptr, e), e;
        }
        __destroy_into_raw() {
            const t = this.__wbg_ptr;
            return this.__wbg_ptr = 0, Ue.unregister(this), t;
        }
        free() {
            const t = this.__destroy_into_raw();
            i.__wbg_rawcontactpair_free(t, 0);
        }
        collider1() {
            return i.rawcontactpair_collider1(this.__wbg_ptr);
        }
        collider2() {
            return i.rawcontactpair_collider2(this.__wbg_ptr);
        }
        numContactManifolds() {
            return i.rawcontactpair_numContactManifolds(this.__wbg_ptr) >>> 0;
        }
        contactManifold(t) {
            const e = i.rawcontactpair_contactManifold(this.__wbg_ptr, t);
            return e === 0 ? void 0 : be.__wrap(e);
        }
    }
    const Xe = typeof FinalizationRegistry > "u" ? {
        register: ()=>{},
        unregister: ()=>{}
    } : new FinalizationRegistry((s)=>i.__wbg_rawdebugrenderpipeline_free(s >>> 0, 1));
    class _i {
        __destroy_into_raw() {
            const t = this.__wbg_ptr;
            return this.__wbg_ptr = 0, Xe.unregister(this), t;
        }
        free() {
            const t = this.__destroy_into_raw();
            i.__wbg_rawdebugrenderpipeline_free(t, 0);
        }
        constructor(){
            const t = i.rawdebugrenderpipeline_new();
            return this.__wbg_ptr = t >>> 0, Xe.register(this, this.__wbg_ptr, this), this;
        }
        vertices() {
            const t = i.rawdebugrenderpipeline_vertices(this.__wbg_ptr);
            return lt(t);
        }
        colors() {
            const t = i.rawdebugrenderpipeline_colors(this.__wbg_ptr);
            return lt(t);
        }
        render(t, e, r, n, a, o, w) {
            try {
                _(t, E), _(e, A), _(r, X), _(n, K), _(a, Z), i.rawdebugrenderpipeline_render(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, n.__wbg_ptr, a.__wbg_ptr, o, x(w));
            } finally{
                R[C++] = void 0;
            }
        }
    }
    const Je = typeof FinalizationRegistry > "u" ? {
        register: ()=>{},
        unregister: ()=>{}
    } : new FinalizationRegistry((s)=>i.__wbg_rawdeserializedworld_free(s >>> 0, 1));
    class me {
        static __wrap(t) {
            t = t >>> 0;
            const e = Object.create(me.prototype);
            return e.__wbg_ptr = t, Je.register(e, e.__wbg_ptr, e), e;
        }
        __destroy_into_raw() {
            const t = this.__wbg_ptr;
            return this.__wbg_ptr = 0, Je.unregister(this), t;
        }
        free() {
            const t = this.__destroy_into_raw();
            i.__wbg_rawdeserializedworld_free(t, 0);
        }
        takeGravity() {
            const t = i.rawdeserializedworld_takeGravity(this.__wbg_ptr);
            return t === 0 ? void 0 : l.__wrap(t);
        }
        takeIntegrationParameters() {
            const t = i.rawdeserializedworld_takeIntegrationParameters(this.__wbg_ptr);
            return t === 0 ? void 0 : rt.__wrap(t);
        }
        takeIslandManager() {
            const t = i.rawdeserializedworld_takeIslandManager(this.__wbg_ptr);
            return t === 0 ? void 0 : J.__wrap(t);
        }
        takeBroadPhase() {
            const t = i.rawdeserializedworld_takeBroadPhase(this.__wbg_ptr);
            return t === 0 ? void 0 : et.__wrap(t);
        }
        takeNarrowPhase() {
            const t = i.rawdeserializedworld_takeNarrowPhase(this.__wbg_ptr);
            return t === 0 ? void 0 : Z.__wrap(t);
        }
        takeBodies() {
            const t = i.rawdeserializedworld_takeBodies(this.__wbg_ptr);
            return t === 0 ? void 0 : E.__wrap(t);
        }
        takeColliders() {
            const t = i.rawdeserializedworld_takeColliders(this.__wbg_ptr);
            return t === 0 ? void 0 : A.__wrap(t);
        }
        takeImpulseJoints() {
            const t = i.rawdeserializedworld_takeImpulseJoints(this.__wbg_ptr);
            return t === 0 ? void 0 : X.__wrap(t);
        }
        takeMultibodyJoints() {
            const t = i.rawdeserializedworld_takeMultibodyJoints(this.__wbg_ptr);
            return t === 0 ? void 0 : K.__wrap(t);
        }
    }
    const Ke = typeof FinalizationRegistry > "u" ? {
        register: ()=>{},
        unregister: ()=>{}
    } : new FinalizationRegistry((s)=>i.__wbg_rawdynamicraycastvehiclecontroller_free(s >>> 0, 1));
    class li {
        __destroy_into_raw() {
            const t = this.__wbg_ptr;
            return this.__wbg_ptr = 0, Ke.unregister(this), t;
        }
        free() {
            const t = this.__destroy_into_raw();
            i.__wbg_rawdynamicraycastvehiclecontroller_free(t, 0);
        }
        constructor(t){
            const e = i.rawdynamicraycastvehiclecontroller_new(t);
            return this.__wbg_ptr = e >>> 0, Ke.register(this, this.__wbg_ptr, this), this;
        }
        current_vehicle_speed() {
            return i.rawdynamicraycastvehiclecontroller_current_vehicle_speed(this.__wbg_ptr);
        }
        chassis() {
            return i.rawdynamicraycastvehiclecontroller_chassis(this.__wbg_ptr);
        }
        index_up_axis() {
            return i.rawdynamicraycastvehiclecontroller_index_up_axis(this.__wbg_ptr) >>> 0;
        }
        set_index_up_axis(t) {
            i.rawdynamicraycastvehiclecontroller_set_index_up_axis(this.__wbg_ptr, t);
        }
        index_forward_axis() {
            return i.rawdynamicraycastvehiclecontroller_index_forward_axis(this.__wbg_ptr) >>> 0;
        }
        set_index_forward_axis(t) {
            i.rawdynamicraycastvehiclecontroller_set_index_forward_axis(this.__wbg_ptr, t);
        }
        add_wheel(t, e, r, n, a) {
            _(t, l), _(e, l), _(r, l), i.rawdynamicraycastvehiclecontroller_add_wheel(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, n, a);
        }
        num_wheels() {
            return i.rawdynamicraycastvehiclecontroller_num_wheels(this.__wbg_ptr) >>> 0;
        }
        update_vehicle(t, e, r, n, a, o, w) {
            try {
                _(e, E), _(r, A), _(n, ye), i.rawdynamicraycastvehiclecontroller_update_vehicle(this.__wbg_ptr, t, e.__wbg_ptr, r.__wbg_ptr, n.__wbg_ptr, a, f(o) ? 4294967297 : o >>> 0, x(w));
            } finally{
                R[C++] = void 0;
            }
        }
        wheel_chassis_connection_point_cs(t) {
            const e = i.rawdynamicraycastvehiclecontroller_wheel_chassis_connection_point_cs(this.__wbg_ptr, t);
            return e === 0 ? void 0 : l.__wrap(e);
        }
        set_wheel_chassis_connection_point_cs(t, e) {
            _(e, l), i.rawdynamicraycastvehiclecontroller_set_wheel_chassis_connection_point_cs(this.__wbg_ptr, t, e.__wbg_ptr);
        }
        wheel_suspension_rest_length(t) {
            const e = i.rawdynamicraycastvehiclecontroller_wheel_suspension_rest_length(this.__wbg_ptr, t);
            return e === 4294967297 ? void 0 : e;
        }
        set_wheel_suspension_rest_length(t, e) {
            i.rawdynamicraycastvehiclecontroller_set_wheel_suspension_rest_length(this.__wbg_ptr, t, e);
        }
        wheel_max_suspension_travel(t) {
            const e = i.rawdynamicraycastvehiclecontroller_wheel_max_suspension_travel(this.__wbg_ptr, t);
            return e === 4294967297 ? void 0 : e;
        }
        set_wheel_max_suspension_travel(t, e) {
            i.rawdynamicraycastvehiclecontroller_set_wheel_max_suspension_travel(this.__wbg_ptr, t, e);
        }
        wheel_radius(t) {
            const e = i.rawdynamicraycastvehiclecontroller_wheel_radius(this.__wbg_ptr, t);
            return e === 4294967297 ? void 0 : e;
        }
        set_wheel_radius(t, e) {
            i.rawdynamicraycastvehiclecontroller_set_wheel_radius(this.__wbg_ptr, t, e);
        }
        wheel_suspension_stiffness(t) {
            const e = i.rawdynamicraycastvehiclecontroller_wheel_suspension_stiffness(this.__wbg_ptr, t);
            return e === 4294967297 ? void 0 : e;
        }
        set_wheel_suspension_stiffness(t, e) {
            i.rawdynamicraycastvehiclecontroller_set_wheel_suspension_stiffness(this.__wbg_ptr, t, e);
        }
        wheel_suspension_compression(t) {
            const e = i.rawdynamicraycastvehiclecontroller_wheel_suspension_compression(this.__wbg_ptr, t);
            return e === 4294967297 ? void 0 : e;
        }
        set_wheel_suspension_compression(t, e) {
            i.rawdynamicraycastvehiclecontroller_set_wheel_suspension_compression(this.__wbg_ptr, t, e);
        }
        wheel_suspension_relaxation(t) {
            const e = i.rawdynamicraycastvehiclecontroller_wheel_suspension_relaxation(this.__wbg_ptr, t);
            return e === 4294967297 ? void 0 : e;
        }
        set_wheel_suspension_relaxation(t, e) {
            i.rawdynamicraycastvehiclecontroller_set_wheel_suspension_relaxation(this.__wbg_ptr, t, e);
        }
        wheel_max_suspension_force(t) {
            const e = i.rawdynamicraycastvehiclecontroller_wheel_max_suspension_force(this.__wbg_ptr, t);
            return e === 4294967297 ? void 0 : e;
        }
        set_wheel_max_suspension_force(t, e) {
            i.rawdynamicraycastvehiclecontroller_set_wheel_max_suspension_force(this.__wbg_ptr, t, e);
        }
        wheel_brake(t) {
            const e = i.rawdynamicraycastvehiclecontroller_wheel_brake(this.__wbg_ptr, t);
            return e === 4294967297 ? void 0 : e;
        }
        set_wheel_brake(t, e) {
            i.rawdynamicraycastvehiclecontroller_set_wheel_brake(this.__wbg_ptr, t, e);
        }
        wheel_steering(t) {
            const e = i.rawdynamicraycastvehiclecontroller_wheel_steering(this.__wbg_ptr, t);
            return e === 4294967297 ? void 0 : e;
        }
        set_wheel_steering(t, e) {
            i.rawdynamicraycastvehiclecontroller_set_wheel_steering(this.__wbg_ptr, t, e);
        }
        wheel_engine_force(t) {
            const e = i.rawdynamicraycastvehiclecontroller_wheel_engine_force(this.__wbg_ptr, t);
            return e === 4294967297 ? void 0 : e;
        }
        set_wheel_engine_force(t, e) {
            i.rawdynamicraycastvehiclecontroller_set_wheel_engine_force(this.__wbg_ptr, t, e);
        }
        wheel_direction_cs(t) {
            const e = i.rawdynamicraycastvehiclecontroller_wheel_direction_cs(this.__wbg_ptr, t);
            return e === 0 ? void 0 : l.__wrap(e);
        }
        set_wheel_direction_cs(t, e) {
            _(e, l), i.rawdynamicraycastvehiclecontroller_set_wheel_direction_cs(this.__wbg_ptr, t, e.__wbg_ptr);
        }
        wheel_axle_cs(t) {
            const e = i.rawdynamicraycastvehiclecontroller_wheel_axle_cs(this.__wbg_ptr, t);
            return e === 0 ? void 0 : l.__wrap(e);
        }
        set_wheel_axle_cs(t, e) {
            _(e, l), i.rawdynamicraycastvehiclecontroller_set_wheel_axle_cs(this.__wbg_ptr, t, e.__wbg_ptr);
        }
        wheel_friction_slip(t) {
            const e = i.rawdynamicraycastvehiclecontroller_wheel_friction_slip(this.__wbg_ptr, t);
            return e === 4294967297 ? void 0 : e;
        }
        set_wheel_friction_slip(t, e) {
            i.rawdynamicraycastvehiclecontroller_set_wheel_friction_slip(this.__wbg_ptr, t, e);
        }
        wheel_side_friction_stiffness(t) {
            const e = i.rawdynamicraycastvehiclecontroller_wheel_side_friction_stiffness(this.__wbg_ptr, t);
            return e === 4294967297 ? void 0 : e;
        }
        set_wheel_side_friction_stiffness(t, e) {
            i.rawdynamicraycastvehiclecontroller_set_wheel_side_friction_stiffness(this.__wbg_ptr, t, e);
        }
        wheel_rotation(t) {
            const e = i.rawdynamicraycastvehiclecontroller_wheel_rotation(this.__wbg_ptr, t);
            return e === 4294967297 ? void 0 : e;
        }
        wheel_forward_impulse(t) {
            const e = i.rawdynamicraycastvehiclecontroller_wheel_forward_impulse(this.__wbg_ptr, t);
            return e === 4294967297 ? void 0 : e;
        }
        wheel_side_impulse(t) {
            const e = i.rawdynamicraycastvehiclecontroller_wheel_side_impulse(this.__wbg_ptr, t);
            return e === 4294967297 ? void 0 : e;
        }
        wheel_suspension_force(t) {
            const e = i.rawdynamicraycastvehiclecontroller_wheel_suspension_force(this.__wbg_ptr, t);
            return e === 4294967297 ? void 0 : e;
        }
        wheel_contact_normal_ws(t) {
            const e = i.rawdynamicraycastvehiclecontroller_wheel_contact_normal_ws(this.__wbg_ptr, t);
            return e === 0 ? void 0 : l.__wrap(e);
        }
        wheel_contact_point_ws(t) {
            const e = i.rawdynamicraycastvehiclecontroller_wheel_contact_point_ws(this.__wbg_ptr, t);
            return e === 0 ? void 0 : l.__wrap(e);
        }
        wheel_suspension_length(t) {
            const e = i.rawdynamicraycastvehiclecontroller_wheel_suspension_length(this.__wbg_ptr, t);
            return e === 4294967297 ? void 0 : e;
        }
        wheel_hard_point_ws(t) {
            const e = i.rawdynamicraycastvehiclecontroller_wheel_hard_point_ws(this.__wbg_ptr, t);
            return e === 0 ? void 0 : l.__wrap(e);
        }
        wheel_is_in_contact(t) {
            return i.rawdynamicraycastvehiclecontroller_wheel_is_in_contact(this.__wbg_ptr, t) !== 0;
        }
        wheel_ground_object(t) {
            try {
                const n = i.__wbindgen_add_to_stack_pointer(-16);
                i.rawdynamicraycastvehiclecontroller_wheel_ground_object(n, this.__wbg_ptr, t);
                var e = F().getInt32(n + 0, !0), r = F().getFloat64(n + 8, !0);
                return e === 0 ? void 0 : r;
            } finally{
                i.__wbindgen_add_to_stack_pointer(16);
            }
        }
    }
    const Ye = typeof FinalizationRegistry > "u" ? {
        register: ()=>{},
        unregister: ()=>{}
    } : new FinalizationRegistry((s)=>i.__wbg_raweventqueue_free(s >>> 0, 1));
    class br {
        __destroy_into_raw() {
            const t = this.__wbg_ptr;
            return this.__wbg_ptr = 0, Ye.unregister(this), t;
        }
        free() {
            const t = this.__destroy_into_raw();
            i.__wbg_raweventqueue_free(t, 0);
        }
        constructor(t){
            const e = i.raweventqueue_new(t);
            return this.__wbg_ptr = e >>> 0, Ye.register(this, this.__wbg_ptr, this), this;
        }
        drainCollisionEvents(t) {
            try {
                i.raweventqueue_drainCollisionEvents(this.__wbg_ptr, x(t));
            } finally{
                R[C++] = void 0;
            }
        }
        drainContactForceEvents(t) {
            try {
                i.raweventqueue_drainContactForceEvents(this.__wbg_ptr, x(t));
            } finally{
                R[C++] = void 0;
            }
        }
        clear() {
            i.raweventqueue_clear(this.__wbg_ptr);
        }
    }
    const Ze = typeof FinalizationRegistry > "u" ? {
        register: ()=>{},
        unregister: ()=>{}
    } : new FinalizationRegistry((s)=>i.__wbg_rawgenericjoint_free(s >>> 0, 1));
    class D {
        static __wrap(t) {
            t = t >>> 0;
            const e = Object.create(D.prototype);
            return e.__wbg_ptr = t, Ze.register(e, e.__wbg_ptr, e), e;
        }
        __destroy_into_raw() {
            const t = this.__wbg_ptr;
            return this.__wbg_ptr = 0, Ze.unregister(this), t;
        }
        free() {
            const t = this.__destroy_into_raw();
            i.__wbg_rawgenericjoint_free(t, 0);
        }
        static generic(t, e, r, n) {
            _(t, l), _(e, l), _(r, l);
            const a = i.rawgenericjoint_generic(t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, n);
            return a === 0 ? void 0 : D.__wrap(a);
        }
        static spring(t, e, r, n, a) {
            _(n, l), _(a, l);
            const o = i.rawgenericjoint_spring(t, e, r, n.__wbg_ptr, a.__wbg_ptr);
            return D.__wrap(o);
        }
        static rope(t, e, r) {
            _(e, l), _(r, l);
            const n = i.rawgenericjoint_rope(t, e.__wbg_ptr, r.__wbg_ptr);
            return D.__wrap(n);
        }
        static spherical(t, e) {
            _(t, l), _(e, l);
            const r = i.rawgenericjoint_spherical(t.__wbg_ptr, e.__wbg_ptr);
            return D.__wrap(r);
        }
        static prismatic(t, e, r, n, a, o) {
            _(t, l), _(e, l), _(r, l);
            const w = i.rawgenericjoint_prismatic(t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, n, a, o);
            return w === 0 ? void 0 : D.__wrap(w);
        }
        static fixed(t, e, r, n) {
            _(t, l), _(e, S), _(r, l), _(n, S);
            const a = i.rawgenericjoint_fixed(t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, n.__wbg_ptr);
            return D.__wrap(a);
        }
        static revolute(t, e, r) {
            _(t, l), _(e, l), _(r, l);
            const n = i.rawgenericjoint_revolute(t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr);
            return n === 0 ? void 0 : D.__wrap(n);
        }
    }
    const Jt = typeof FinalizationRegistry > "u" ? {
        register: ()=>{},
        unregister: ()=>{}
    } : new FinalizationRegistry((s)=>i.__wbg_rawimpulsejointset_free(s >>> 0, 1));
    class X {
        static __wrap(t) {
            t = t >>> 0;
            const e = Object.create(X.prototype);
            return e.__wbg_ptr = t, Jt.register(e, e.__wbg_ptr, e), e;
        }
        __destroy_into_raw() {
            const t = this.__wbg_ptr;
            return this.__wbg_ptr = 0, Jt.unregister(this), t;
        }
        free() {
            const t = this.__destroy_into_raw();
            i.__wbg_rawimpulsejointset_free(t, 0);
        }
        jointType(t) {
            return i.rawimpulsejointset_jointType(this.__wbg_ptr, t);
        }
        jointBodyHandle1(t) {
            return i.rawimpulsejointset_jointBodyHandle1(this.__wbg_ptr, t);
        }
        jointBodyHandle2(t) {
            return i.rawimpulsejointset_jointBodyHandle2(this.__wbg_ptr, t);
        }
        jointFrameX1(t) {
            const e = i.rawimpulsejointset_jointFrameX1(this.__wbg_ptr, t);
            return S.__wrap(e);
        }
        jointFrameX2(t) {
            const e = i.rawimpulsejointset_jointFrameX2(this.__wbg_ptr, t);
            return S.__wrap(e);
        }
        jointAnchor1(t) {
            const e = i.rawimpulsejointset_jointAnchor1(this.__wbg_ptr, t);
            return l.__wrap(e);
        }
        jointAnchor2(t) {
            const e = i.rawimpulsejointset_jointAnchor2(this.__wbg_ptr, t);
            return l.__wrap(e);
        }
        jointSetAnchor1(t, e) {
            _(e, l), i.rawimpulsejointset_jointSetAnchor1(this.__wbg_ptr, t, e.__wbg_ptr);
        }
        jointSetAnchor2(t, e) {
            _(e, l), i.rawimpulsejointset_jointSetAnchor2(this.__wbg_ptr, t, e.__wbg_ptr);
        }
        jointContactsEnabled(t) {
            return i.rawimpulsejointset_jointContactsEnabled(this.__wbg_ptr, t) !== 0;
        }
        jointSetContactsEnabled(t, e) {
            i.rawimpulsejointset_jointSetContactsEnabled(this.__wbg_ptr, t, e);
        }
        jointLimitsEnabled(t, e) {
            return i.rawimpulsejointset_jointLimitsEnabled(this.__wbg_ptr, t, e) !== 0;
        }
        jointLimitsMin(t, e) {
            return i.rawimpulsejointset_jointLimitsMin(this.__wbg_ptr, t, e);
        }
        jointLimitsMax(t, e) {
            return i.rawimpulsejointset_jointLimitsMax(this.__wbg_ptr, t, e);
        }
        jointSetLimits(t, e, r, n) {
            i.rawimpulsejointset_jointSetLimits(this.__wbg_ptr, t, e, r, n);
        }
        jointConfigureMotorModel(t, e, r) {
            i.rawimpulsejointset_jointConfigureMotorModel(this.__wbg_ptr, t, e, r);
        }
        jointConfigureMotorVelocity(t, e, r, n) {
            i.rawimpulsejointset_jointConfigureMotorVelocity(this.__wbg_ptr, t, e, r, n);
        }
        jointConfigureMotorPosition(t, e, r, n, a) {
            i.rawimpulsejointset_jointConfigureMotorPosition(this.__wbg_ptr, t, e, r, n, a);
        }
        jointConfigureMotor(t, e, r, n, a, o) {
            i.rawimpulsejointset_jointConfigureMotor(this.__wbg_ptr, t, e, r, n, a, o);
        }
        constructor(){
            const t = i.rawimpulsejointset_new();
            return this.__wbg_ptr = t >>> 0, Jt.register(this, this.__wbg_ptr, this), this;
        }
        createJoint(t, e, r, n) {
            return _(t, D), i.rawimpulsejointset_createJoint(this.__wbg_ptr, t.__wbg_ptr, e, r, n);
        }
        remove(t, e) {
            i.rawimpulsejointset_remove(this.__wbg_ptr, t, e);
        }
        len() {
            return i.rawimpulsejointset_len(this.__wbg_ptr) >>> 0;
        }
        contains(t) {
            return i.rawimpulsejointset_contains(this.__wbg_ptr, t) !== 0;
        }
        forEachJointHandle(t) {
            try {
                i.rawimpulsejointset_forEachJointHandle(this.__wbg_ptr, x(t));
            } finally{
                R[C++] = void 0;
            }
        }
        forEachJointAttachedToRigidBody(t, e) {
            try {
                i.rawimpulsejointset_forEachJointAttachedToRigidBody(this.__wbg_ptr, t, x(e));
            } finally{
                R[C++] = void 0;
            }
        }
    }
    const Kt = typeof FinalizationRegistry > "u" ? {
        register: ()=>{},
        unregister: ()=>{}
    } : new FinalizationRegistry((s)=>i.__wbg_rawintegrationparameters_free(s >>> 0, 1));
    class rt {
        static __wrap(t) {
            t = t >>> 0;
            const e = Object.create(rt.prototype);
            return e.__wbg_ptr = t, Kt.register(e, e.__wbg_ptr, e), e;
        }
        __destroy_into_raw() {
            const t = this.__wbg_ptr;
            return this.__wbg_ptr = 0, Kt.unregister(this), t;
        }
        free() {
            const t = this.__destroy_into_raw();
            i.__wbg_rawintegrationparameters_free(t, 0);
        }
        constructor(){
            const t = i.rawintegrationparameters_new();
            return this.__wbg_ptr = t >>> 0, Kt.register(this, this.__wbg_ptr, this), this;
        }
        get dt() {
            return i.rawintegrationparameters_dt(this.__wbg_ptr);
        }
        get contact_erp() {
            return i.rawintegrationparameters_contact_erp(this.__wbg_ptr);
        }
        get normalizedAllowedLinearError() {
            return i.rawdynamicraycastvehiclecontroller_current_vehicle_speed(this.__wbg_ptr);
        }
        get normalizedPredictionDistance() {
            return i.rawcontactforceevent_max_force_magnitude(this.__wbg_ptr);
        }
        get numSolverIterations() {
            return i.rawintegrationparameters_numSolverIterations(this.__wbg_ptr) >>> 0;
        }
        get numAdditionalFrictionIterations() {
            return i.rawdynamicraycastvehiclecontroller_index_up_axis(this.__wbg_ptr) >>> 0;
        }
        get numInternalPgsIterations() {
            return i.rawdynamicraycastvehiclecontroller_index_forward_axis(this.__wbg_ptr) >>> 0;
        }
        get minIslandSize() {
            return i.rawintegrationparameters_minIslandSize(this.__wbg_ptr) >>> 0;
        }
        get maxCcdSubsteps() {
            return i.rawintegrationparameters_maxCcdSubsteps(this.__wbg_ptr) >>> 0;
        }
        get lengthUnit() {
            return i.rawintegrationparameters_lengthUnit(this.__wbg_ptr);
        }
        set dt(t) {
            i.rawintegrationparameters_set_dt(this.__wbg_ptr, t);
        }
        set contact_natural_frequency(t) {
            i.rawintegrationparameters_set_contact_natural_frequency(this.__wbg_ptr, t);
        }
        set normalizedAllowedLinearError(t) {
            i.rawintegrationparameters_set_normalizedAllowedLinearError(this.__wbg_ptr, t);
        }
        set normalizedPredictionDistance(t) {
            i.rawintegrationparameters_set_normalizedPredictionDistance(this.__wbg_ptr, t);
        }
        set numSolverIterations(t) {
            i.rawintegrationparameters_set_numSolverIterations(this.__wbg_ptr, t);
        }
        set numAdditionalFrictionIterations(t) {
            i.rawdynamicraycastvehiclecontroller_set_index_up_axis(this.__wbg_ptr, t);
        }
        set numInternalPgsIterations(t) {
            i.rawdynamicraycastvehiclecontroller_set_index_forward_axis(this.__wbg_ptr, t);
        }
        set minIslandSize(t) {
            i.rawintegrationparameters_set_minIslandSize(this.__wbg_ptr, t);
        }
        set maxCcdSubsteps(t) {
            i.rawintegrationparameters_set_maxCcdSubsteps(this.__wbg_ptr, t);
        }
        set lengthUnit(t) {
            i.rawintegrationparameters_set_lengthUnit(this.__wbg_ptr, t);
        }
        switchToStandardPgsSolver() {
            i.rawintegrationparameters_switchToStandardPgsSolver(this.__wbg_ptr);
        }
        switchToSmallStepsPgsSolver() {
            i.rawintegrationparameters_switchToSmallStepsPgsSolver(this.__wbg_ptr);
        }
        switchToSmallStepsPgsSolverWithoutWarmstart() {
            i.rawintegrationparameters_switchToSmallStepsPgsSolverWithoutWarmstart(this.__wbg_ptr);
        }
    }
    const Yt = typeof FinalizationRegistry > "u" ? {
        register: ()=>{},
        unregister: ()=>{}
    } : new FinalizationRegistry((s)=>i.__wbg_rawislandmanager_free(s >>> 0, 1));
    class J {
        static __wrap(t) {
            t = t >>> 0;
            const e = Object.create(J.prototype);
            return e.__wbg_ptr = t, Yt.register(e, e.__wbg_ptr, e), e;
        }
        __destroy_into_raw() {
            const t = this.__wbg_ptr;
            return this.__wbg_ptr = 0, Yt.unregister(this), t;
        }
        free() {
            const t = this.__destroy_into_raw();
            i.__wbg_rawislandmanager_free(t, 0);
        }
        constructor(){
            const t = i.rawislandmanager_new();
            return this.__wbg_ptr = t >>> 0, Yt.register(this, this.__wbg_ptr, this), this;
        }
        forEachActiveRigidBodyHandle(t) {
            try {
                i.rawislandmanager_forEachActiveRigidBodyHandle(this.__wbg_ptr, x(t));
            } finally{
                R[C++] = void 0;
            }
        }
    }
    const $e = typeof FinalizationRegistry > "u" ? {
        register: ()=>{},
        unregister: ()=>{}
    } : new FinalizationRegistry((s)=>i.__wbg_rawkinematiccharactercontroller_free(s >>> 0, 1));
    class ci {
        __destroy_into_raw() {
            const t = this.__wbg_ptr;
            return this.__wbg_ptr = 0, $e.unregister(this), t;
        }
        free() {
            const t = this.__destroy_into_raw();
            i.__wbg_rawkinematiccharactercontroller_free(t, 0);
        }
        constructor(t){
            const e = i.rawkinematiccharactercontroller_new(t);
            return this.__wbg_ptr = e >>> 0, $e.register(this, this.__wbg_ptr, this), this;
        }
        up() {
            const t = i.rawcharactercollision_translationDeltaApplied(this.__wbg_ptr);
            return l.__wrap(t);
        }
        setUp(t) {
            _(t, l), i.rawkinematiccharactercontroller_setUp(this.__wbg_ptr, t.__wbg_ptr);
        }
        normalNudgeFactor() {
            return i.rawkinematiccharactercontroller_normalNudgeFactor(this.__wbg_ptr);
        }
        setNormalNudgeFactor(t) {
            i.rawkinematiccharactercontroller_setNormalNudgeFactor(this.__wbg_ptr, t);
        }
        offset() {
            return i.rawintegrationparameters_dt(this.__wbg_ptr);
        }
        setOffset(t) {
            i.rawkinematiccharactercontroller_setOffset(this.__wbg_ptr, t);
        }
        slideEnabled() {
            return i.rawkinematiccharactercontroller_slideEnabled(this.__wbg_ptr) !== 0;
        }
        setSlideEnabled(t) {
            i.rawkinematiccharactercontroller_setSlideEnabled(this.__wbg_ptr, t);
        }
        autostepMaxHeight() {
            const t = i.rawkinematiccharactercontroller_autostepMaxHeight(this.__wbg_ptr);
            return t === 4294967297 ? void 0 : t;
        }
        autostepMinWidth() {
            const t = i.rawkinematiccharactercontroller_autostepMinWidth(this.__wbg_ptr);
            return t === 4294967297 ? void 0 : t;
        }
        autostepIncludesDynamicBodies() {
            const t = i.rawkinematiccharactercontroller_autostepIncludesDynamicBodies(this.__wbg_ptr);
            return t === 16777215 ? void 0 : t !== 0;
        }
        autostepEnabled() {
            return i.rawkinematiccharactercontroller_autostepEnabled(this.__wbg_ptr) !== 0;
        }
        enableAutostep(t, e, r) {
            i.rawkinematiccharactercontroller_enableAutostep(this.__wbg_ptr, t, e, r);
        }
        disableAutostep() {
            i.rawkinematiccharactercontroller_disableAutostep(this.__wbg_ptr);
        }
        maxSlopeClimbAngle() {
            return i.rawkinematiccharactercontroller_maxSlopeClimbAngle(this.__wbg_ptr);
        }
        setMaxSlopeClimbAngle(t) {
            i.rawkinematiccharactercontroller_setMaxSlopeClimbAngle(this.__wbg_ptr, t);
        }
        minSlopeSlideAngle() {
            return i.rawkinematiccharactercontroller_minSlopeSlideAngle(this.__wbg_ptr);
        }
        setMinSlopeSlideAngle(t) {
            i.rawkinematiccharactercontroller_setMinSlopeSlideAngle(this.__wbg_ptr, t);
        }
        snapToGroundDistance() {
            const t = i.rawkinematiccharactercontroller_snapToGroundDistance(this.__wbg_ptr);
            return t === 4294967297 ? void 0 : t;
        }
        enableSnapToGround(t) {
            i.rawkinematiccharactercontroller_enableSnapToGround(this.__wbg_ptr, t);
        }
        disableSnapToGround() {
            i.rawkinematiccharactercontroller_disableSnapToGround(this.__wbg_ptr);
        }
        snapToGroundEnabled() {
            return i.rawkinematiccharactercontroller_snapToGroundEnabled(this.__wbg_ptr) !== 0;
        }
        computeColliderMovement(t, e, r, n, a, o, w, h, d, p, u) {
            try {
                _(e, E), _(r, A), _(n, ye), _(o, l), i.rawkinematiccharactercontroller_computeColliderMovement(this.__wbg_ptr, t, e.__wbg_ptr, r.__wbg_ptr, n.__wbg_ptr, a, o.__wbg_ptr, w, f(h) ? 4294967297 : Math.fround(h), d, f(p) ? 4294967297 : p >>> 0, x(u));
            } finally{
                R[C++] = void 0;
            }
        }
        computedMovement() {
            const t = i.rawkinematiccharactercontroller_computedMovement(this.__wbg_ptr);
            return l.__wrap(t);
        }
        computedGrounded() {
            return i.rawkinematiccharactercontroller_computedGrounded(this.__wbg_ptr) !== 0;
        }
        numComputedCollisions() {
            return i.rawkinematiccharactercontroller_numComputedCollisions(this.__wbg_ptr) >>> 0;
        }
        computedCollision(t, e) {
            return _(e, gr), i.rawkinematiccharactercontroller_computedCollision(this.__wbg_ptr, t, e.__wbg_ptr) !== 0;
        }
    }
    const Zt = typeof FinalizationRegistry > "u" ? {
        register: ()=>{},
        unregister: ()=>{}
    } : new FinalizationRegistry((s)=>i.__wbg_rawmultibodyjointset_free(s >>> 0, 1));
    class K {
        static __wrap(t) {
            t = t >>> 0;
            const e = Object.create(K.prototype);
            return e.__wbg_ptr = t, Zt.register(e, e.__wbg_ptr, e), e;
        }
        __destroy_into_raw() {
            const t = this.__wbg_ptr;
            return this.__wbg_ptr = 0, Zt.unregister(this), t;
        }
        free() {
            const t = this.__destroy_into_raw();
            i.__wbg_rawmultibodyjointset_free(t, 0);
        }
        jointType(t) {
            return i.rawmultibodyjointset_jointType(this.__wbg_ptr, t);
        }
        jointFrameX1(t) {
            const e = i.rawmultibodyjointset_jointFrameX1(this.__wbg_ptr, t);
            return S.__wrap(e);
        }
        jointFrameX2(t) {
            const e = i.rawmultibodyjointset_jointFrameX2(this.__wbg_ptr, t);
            return S.__wrap(e);
        }
        jointAnchor1(t) {
            const e = i.rawmultibodyjointset_jointAnchor1(this.__wbg_ptr, t);
            return l.__wrap(e);
        }
        jointAnchor2(t) {
            const e = i.rawmultibodyjointset_jointAnchor2(this.__wbg_ptr, t);
            return l.__wrap(e);
        }
        jointContactsEnabled(t) {
            return i.rawmultibodyjointset_jointContactsEnabled(this.__wbg_ptr, t) !== 0;
        }
        jointSetContactsEnabled(t, e) {
            i.rawmultibodyjointset_jointSetContactsEnabled(this.__wbg_ptr, t, e);
        }
        jointLimitsEnabled(t, e) {
            return i.rawmultibodyjointset_jointLimitsEnabled(this.__wbg_ptr, t, e) !== 0;
        }
        jointLimitsMin(t, e) {
            return i.rawmultibodyjointset_jointLimitsMin(this.__wbg_ptr, t, e);
        }
        jointLimitsMax(t, e) {
            return i.rawmultibodyjointset_jointLimitsMax(this.__wbg_ptr, t, e);
        }
        constructor(){
            const t = i.rawmultibodyjointset_new();
            return this.__wbg_ptr = t >>> 0, Zt.register(this, this.__wbg_ptr, this), this;
        }
        createJoint(t, e, r, n) {
            return _(t, D), i.rawmultibodyjointset_createJoint(this.__wbg_ptr, t.__wbg_ptr, e, r, n);
        }
        remove(t, e) {
            i.rawmultibodyjointset_remove(this.__wbg_ptr, t, e);
        }
        contains(t) {
            return i.rawmultibodyjointset_contains(this.__wbg_ptr, t) !== 0;
        }
        forEachJointHandle(t) {
            try {
                i.rawmultibodyjointset_forEachJointHandle(this.__wbg_ptr, x(t));
            } finally{
                R[C++] = void 0;
            }
        }
        forEachJointAttachedToRigidBody(t, e) {
            try {
                i.rawmultibodyjointset_forEachJointAttachedToRigidBody(this.__wbg_ptr, t, x(e));
            } finally{
                R[C++] = void 0;
            }
        }
    }
    const $t = typeof FinalizationRegistry > "u" ? {
        register: ()=>{},
        unregister: ()=>{}
    } : new FinalizationRegistry((s)=>i.__wbg_rawnarrowphase_free(s >>> 0, 1));
    class Z {
        static __wrap(t) {
            t = t >>> 0;
            const e = Object.create(Z.prototype);
            return e.__wbg_ptr = t, $t.register(e, e.__wbg_ptr, e), e;
        }
        __destroy_into_raw() {
            const t = this.__wbg_ptr;
            return this.__wbg_ptr = 0, $t.unregister(this), t;
        }
        free() {
            const t = this.__destroy_into_raw();
            i.__wbg_rawnarrowphase_free(t, 0);
        }
        constructor(){
            const t = i.rawnarrowphase_new();
            return this.__wbg_ptr = t >>> 0, $t.register(this, this.__wbg_ptr, this), this;
        }
        contact_pairs_with(t, e) {
            i.rawnarrowphase_contact_pairs_with(this.__wbg_ptr, t, z(e));
        }
        contact_pair(t, e) {
            const r = i.rawnarrowphase_contact_pair(this.__wbg_ptr, t, e);
            return r === 0 ? void 0 : fe.__wrap(r);
        }
        intersection_pairs_with(t, e) {
            i.rawnarrowphase_intersection_pairs_with(this.__wbg_ptr, t, z(e));
        }
        intersection_pair(t, e) {
            return i.rawnarrowphase_intersection_pair(this.__wbg_ptr, t, e) !== 0;
        }
    }
    const Qe = typeof FinalizationRegistry > "u" ? {
        register: ()=>{},
        unregister: ()=>{}
    } : new FinalizationRegistry((s)=>i.__wbg_rawphysicspipeline_free(s >>> 0, 1));
    class wi {
        __destroy_into_raw() {
            const t = this.__wbg_ptr;
            return this.__wbg_ptr = 0, Qe.unregister(this), t;
        }
        free() {
            const t = this.__destroy_into_raw();
            i.__wbg_rawphysicspipeline_free(t, 0);
        }
        constructor(){
            const t = i.rawphysicspipeline_new();
            return this.__wbg_ptr = t >>> 0, Qe.register(this, this.__wbg_ptr, this), this;
        }
        step(t, e, r, n, a, o, w, h, d, p) {
            _(t, l), _(e, rt), _(r, J), _(n, et), _(a, Z), _(o, E), _(w, A), _(h, X), _(d, K), _(p, re), i.rawphysicspipeline_step(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, n.__wbg_ptr, a.__wbg_ptr, o.__wbg_ptr, w.__wbg_ptr, h.__wbg_ptr, d.__wbg_ptr, p.__wbg_ptr);
        }
        stepWithEvents(t, e, r, n, a, o, w, h, d, p, u, g, m, I) {
            _(t, l), _(e, rt), _(r, J), _(n, et), _(a, Z), _(o, E), _(w, A), _(h, X), _(d, K), _(p, re), _(u, br), i.rawphysicspipeline_stepWithEvents(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, n.__wbg_ptr, a.__wbg_ptr, o.__wbg_ptr, w.__wbg_ptr, h.__wbg_ptr, d.__wbg_ptr, p.__wbg_ptr, u.__wbg_ptr, z(g), z(m), z(I));
        }
    }
    const tr = typeof FinalizationRegistry > "u" ? {
        register: ()=>{},
        unregister: ()=>{}
    } : new FinalizationRegistry((s)=>i.__wbg_rawpidcontroller_free(s >>> 0, 1));
    class hi {
        __destroy_into_raw() {
            const t = this.__wbg_ptr;
            return this.__wbg_ptr = 0, tr.unregister(this), t;
        }
        free() {
            const t = this.__destroy_into_raw();
            i.__wbg_rawpidcontroller_free(t, 0);
        }
        constructor(t, e, r, n){
            const a = i.rawpidcontroller_new(t, e, r, n);
            return this.__wbg_ptr = a >>> 0, tr.register(this, this.__wbg_ptr, this), this;
        }
        set_kp(t, e) {
            i.rawpidcontroller_set_kp(this.__wbg_ptr, t, e);
        }
        set_ki(t, e) {
            i.rawpidcontroller_set_ki(this.__wbg_ptr, t, e);
        }
        set_kd(t, e) {
            i.rawpidcontroller_set_kd(this.__wbg_ptr, t, e);
        }
        set_axes_mask(t) {
            i.rawpidcontroller_set_axes_mask(this.__wbg_ptr, t);
        }
        reset_integrals() {
            i.rawpidcontroller_reset_integrals(this.__wbg_ptr);
        }
        apply_linear_correction(t, e, r, n, a) {
            _(e, E), _(n, l), _(a, l), i.rawpidcontroller_apply_linear_correction(this.__wbg_ptr, t, e.__wbg_ptr, r, n.__wbg_ptr, a.__wbg_ptr);
        }
        apply_angular_correction(t, e, r, n, a) {
            _(e, E), _(n, S), _(a, l), i.rawpidcontroller_apply_angular_correction(this.__wbg_ptr, t, e.__wbg_ptr, r, n.__wbg_ptr, a.__wbg_ptr);
        }
        linear_correction(t, e, r, n, a) {
            _(e, E), _(n, l), _(a, l);
            const o = i.rawpidcontroller_linear_correction(this.__wbg_ptr, t, e.__wbg_ptr, r, n.__wbg_ptr, a.__wbg_ptr);
            return l.__wrap(o);
        }
        angular_correction(t, e, r, n, a) {
            _(e, E), _(n, S), _(a, l);
            const o = i.rawpidcontroller_angular_correction(this.__wbg_ptr, t, e.__wbg_ptr, r, n.__wbg_ptr, a.__wbg_ptr);
            return l.__wrap(o);
        }
    }
    const er = typeof FinalizationRegistry > "u" ? {
        register: ()=>{},
        unregister: ()=>{}
    } : new FinalizationRegistry((s)=>i.__wbg_rawpointcolliderprojection_free(s >>> 0, 1));
    class Rt {
        static __wrap(t) {
            t = t >>> 0;
            const e = Object.create(Rt.prototype);
            return e.__wbg_ptr = t, er.register(e, e.__wbg_ptr, e), e;
        }
        __destroy_into_raw() {
            const t = this.__wbg_ptr;
            return this.__wbg_ptr = 0, er.unregister(this), t;
        }
        free() {
            const t = this.__destroy_into_raw();
            i.__wbg_rawpointcolliderprojection_free(t, 0);
        }
        colliderHandle() {
            return i.rawpointcolliderprojection_colliderHandle(this.__wbg_ptr);
        }
        point() {
            const t = i.rawpointcolliderprojection_point(this.__wbg_ptr);
            return l.__wrap(t);
        }
        isInside() {
            return i.rawpointcolliderprojection_isInside(this.__wbg_ptr) !== 0;
        }
        featureType() {
            return i.rawpointcolliderprojection_featureType(this.__wbg_ptr);
        }
        featureId() {
            const t = i.rawpointcolliderprojection_featureId(this.__wbg_ptr);
            return t === 4294967297 ? void 0 : t;
        }
    }
    const rr = typeof FinalizationRegistry > "u" ? {
        register: ()=>{},
        unregister: ()=>{}
    } : new FinalizationRegistry((s)=>i.__wbg_rawpointprojection_free(s >>> 0, 1));
    class Ft {
        static __wrap(t) {
            t = t >>> 0;
            const e = Object.create(Ft.prototype);
            return e.__wbg_ptr = t, rr.register(e, e.__wbg_ptr, e), e;
        }
        __destroy_into_raw() {
            const t = this.__wbg_ptr;
            return this.__wbg_ptr = 0, rr.unregister(this), t;
        }
        free() {
            const t = this.__destroy_into_raw();
            i.__wbg_rawpointprojection_free(t, 0);
        }
        point() {
            const t = i.rawpointprojection_point(this.__wbg_ptr);
            return l.__wrap(t);
        }
        isInside() {
            return i.rawpointprojection_isInside(this.__wbg_ptr) !== 0;
        }
    }
    const ir = typeof FinalizationRegistry > "u" ? {
        register: ()=>{},
        unregister: ()=>{}
    } : new FinalizationRegistry((s)=>i.__wbg_rawquerypipeline_free(s >>> 0, 1));
    class ye {
        __destroy_into_raw() {
            const t = this.__wbg_ptr;
            return this.__wbg_ptr = 0, ir.unregister(this), t;
        }
        free() {
            const t = this.__destroy_into_raw();
            i.__wbg_rawquerypipeline_free(t, 0);
        }
        constructor(){
            const t = i.rawquerypipeline_new();
            return this.__wbg_ptr = t >>> 0, ir.register(this, this.__wbg_ptr, this), this;
        }
        update(t) {
            _(t, A), i.rawquerypipeline_update(this.__wbg_ptr, t.__wbg_ptr);
        }
        castRay(t, e, r, n, a, o, w, h, d, p, u) {
            try {
                _(t, E), _(e, A), _(r, l), _(n, l);
                const g = i.rawquerypipeline_castRay(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, n.__wbg_ptr, a, o, w, f(h) ? 4294967297 : h >>> 0, !f(d), f(d) ? 0 : d, !f(p), f(p) ? 0 : p, x(u));
                return g === 0 ? void 0 : Se.__wrap(g);
            } finally{
                R[C++] = void 0;
            }
        }
        castRayAndGetNormal(t, e, r, n, a, o, w, h, d, p, u) {
            try {
                _(t, E), _(e, A), _(r, l), _(n, l);
                const g = i.rawquerypipeline_castRayAndGetNormal(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, n.__wbg_ptr, a, o, w, f(h) ? 4294967297 : h >>> 0, !f(d), f(d) ? 0 : d, !f(p), f(p) ? 0 : p, x(u));
                return g === 0 ? void 0 : zt.__wrap(g);
            } finally{
                R[C++] = void 0;
            }
        }
        intersectionsWithRay(t, e, r, n, a, o, w, h, d, p, u, g) {
            try {
                _(t, E), _(e, A), _(r, l), _(n, l), i.rawquerypipeline_intersectionsWithRay(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, n.__wbg_ptr, a, o, x(w), h, f(d) ? 4294967297 : d >>> 0, !f(p), f(p) ? 0 : p, !f(u), f(u) ? 0 : u, x(g));
            } finally{
                R[C++] = void 0, R[C++] = void 0;
            }
        }
        intersectionWithShape(t, e, r, n, a, o, w, h, d, p) {
            try {
                const m = i.__wbindgen_add_to_stack_pointer(-16);
                _(t, E), _(e, A), _(r, l), _(n, S), _(a, b), i.rawquerypipeline_intersectionWithShape(m, this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, n.__wbg_ptr, a.__wbg_ptr, o, f(w) ? 4294967297 : w >>> 0, !f(h), f(h) ? 0 : h, !f(d), f(d) ? 0 : d, x(p));
                var u = F().getInt32(m + 0, !0), g = F().getFloat64(m + 8, !0);
                return u === 0 ? void 0 : g;
            } finally{
                i.__wbindgen_add_to_stack_pointer(16), R[C++] = void 0;
            }
        }
        projectPoint(t, e, r, n, a, o, w, h, d) {
            try {
                _(t, E), _(e, A), _(r, l);
                const p = i.rawquerypipeline_projectPoint(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, n, a, f(o) ? 4294967297 : o >>> 0, !f(w), f(w) ? 0 : w, !f(h), f(h) ? 0 : h, x(d));
                return p === 0 ? void 0 : Rt.__wrap(p);
            } finally{
                R[C++] = void 0;
            }
        }
        projectPointAndGetFeature(t, e, r, n, a, o, w, h) {
            try {
                _(t, E), _(e, A), _(r, l);
                const d = i.rawquerypipeline_projectPointAndGetFeature(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, n, f(a) ? 4294967297 : a >>> 0, !f(o), f(o) ? 0 : o, !f(w), f(w) ? 0 : w, x(h));
                return d === 0 ? void 0 : Rt.__wrap(d);
            } finally{
                R[C++] = void 0;
            }
        }
        intersectionsWithPoint(t, e, r, n, a, o, w, h, d) {
            try {
                _(t, E), _(e, A), _(r, l), i.rawquerypipeline_intersectionsWithPoint(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, x(n), a, f(o) ? 4294967297 : o >>> 0, !f(w), f(w) ? 0 : w, !f(h), f(h) ? 0 : h, x(d));
            } finally{
                R[C++] = void 0, R[C++] = void 0;
            }
        }
        castShape(t, e, r, n, a, o, w, h, d, p, u, g, m, I) {
            try {
                _(t, E), _(e, A), _(r, l), _(n, S), _(a, l), _(o, b);
                const k = i.rawquerypipeline_castShape(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, n.__wbg_ptr, a.__wbg_ptr, o.__wbg_ptr, w, h, d, p, f(u) ? 4294967297 : u >>> 0, !f(g), f(g) ? 0 : g, !f(m), f(m) ? 0 : m, x(I));
                return k === 0 ? void 0 : jt.__wrap(k);
            } finally{
                R[C++] = void 0;
            }
        }
        intersectionsWithShape(t, e, r, n, a, o, w, h, d, p, u) {
            try {
                _(t, E), _(e, A), _(r, l), _(n, S), _(a, b), i.rawquerypipeline_intersectionsWithShape(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, n.__wbg_ptr, a.__wbg_ptr, x(o), w, f(h) ? 4294967297 : h >>> 0, !f(d), f(d) ? 0 : d, !f(p), f(p) ? 0 : p, x(u));
            } finally{
                R[C++] = void 0, R[C++] = void 0;
            }
        }
        collidersWithAabbIntersectingAabb(t, e, r) {
            try {
                _(t, l), _(e, l), i.rawquerypipeline_collidersWithAabbIntersectingAabb(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, x(r));
            } finally{
                R[C++] = void 0;
            }
        }
    }
    const nr = typeof FinalizationRegistry > "u" ? {
        register: ()=>{},
        unregister: ()=>{}
    } : new FinalizationRegistry((s)=>i.__wbg_rawraycolliderhit_free(s >>> 0, 1));
    class Se {
        static __wrap(t) {
            t = t >>> 0;
            const e = Object.create(Se.prototype);
            return e.__wbg_ptr = t, nr.register(e, e.__wbg_ptr, e), e;
        }
        __destroy_into_raw() {
            const t = this.__wbg_ptr;
            return this.__wbg_ptr = 0, nr.unregister(this), t;
        }
        free() {
            const t = this.__destroy_into_raw();
            i.__wbg_rawraycolliderhit_free(t, 0);
        }
        colliderHandle() {
            return i.rawcharactercollision_handle(this.__wbg_ptr);
        }
        timeOfImpact() {
            return i.rawcollidershapecasthit_time_of_impact(this.__wbg_ptr);
        }
    }
    const sr = typeof FinalizationRegistry > "u" ? {
        register: ()=>{},
        unregister: ()=>{}
    } : new FinalizationRegistry((s)=>i.__wbg_rawraycolliderintersection_free(s >>> 0, 1));
    class zt {
        static __wrap(t) {
            t = t >>> 0;
            const e = Object.create(zt.prototype);
            return e.__wbg_ptr = t, sr.register(e, e.__wbg_ptr, e), e;
        }
        __destroy_into_raw() {
            const t = this.__wbg_ptr;
            return this.__wbg_ptr = 0, sr.unregister(this), t;
        }
        free() {
            const t = this.__destroy_into_raw();
            i.__wbg_rawraycolliderintersection_free(t, 0);
        }
        colliderHandle() {
            return i.rawpointcolliderprojection_colliderHandle(this.__wbg_ptr);
        }
        normal() {
            const t = i.rawcollidershapecasthit_witness1(this.__wbg_ptr);
            return l.__wrap(t);
        }
        time_of_impact() {
            return i.rawcollidershapecasthit_time_of_impact(this.__wbg_ptr);
        }
        featureType() {
            return i.rawpointcolliderprojection_featureType(this.__wbg_ptr);
        }
        featureId() {
            const t = i.rawpointcolliderprojection_featureId(this.__wbg_ptr);
            return t === 4294967297 ? void 0 : t;
        }
    }
    const ar = typeof FinalizationRegistry > "u" ? {
        register: ()=>{},
        unregister: ()=>{}
    } : new FinalizationRegistry((s)=>i.__wbg_rawrayintersection_free(s >>> 0, 1));
    class Tt {
        static __wrap(t) {
            t = t >>> 0;
            const e = Object.create(Tt.prototype);
            return e.__wbg_ptr = t, ar.register(e, e.__wbg_ptr, e), e;
        }
        __destroy_into_raw() {
            const t = this.__wbg_ptr;
            return this.__wbg_ptr = 0, ar.unregister(this), t;
        }
        free() {
            const t = this.__destroy_into_raw();
            i.__wbg_rawrayintersection_free(t, 0);
        }
        normal() {
            const t = i.rawcollidershapecasthit_witness1(this.__wbg_ptr);
            return l.__wrap(t);
        }
        time_of_impact() {
            return i.rawcollidershapecasthit_time_of_impact(this.__wbg_ptr);
        }
        featureType() {
            return i.rawpointcolliderprojection_featureType(this.__wbg_ptr);
        }
        featureId() {
            const t = i.rawpointcolliderprojection_featureId(this.__wbg_ptr);
            return t === 4294967297 ? void 0 : t;
        }
    }
    const Qt = typeof FinalizationRegistry > "u" ? {
        register: ()=>{},
        unregister: ()=>{}
    } : new FinalizationRegistry((s)=>i.__wbg_rawrigidbodyset_free(s >>> 0, 1));
    class E {
        static __wrap(t) {
            t = t >>> 0;
            const e = Object.create(E.prototype);
            return e.__wbg_ptr = t, Qt.register(e, e.__wbg_ptr, e), e;
        }
        __destroy_into_raw() {
            const t = this.__wbg_ptr;
            return this.__wbg_ptr = 0, Qt.unregister(this), t;
        }
        free() {
            const t = this.__destroy_into_raw();
            i.__wbg_rawrigidbodyset_free(t, 0);
        }
        rbTranslation(t) {
            const e = i.rawrigidbodyset_rbTranslation(this.__wbg_ptr, t);
            return l.__wrap(e);
        }
        rbRotation(t) {
            const e = i.rawrigidbodyset_rbRotation(this.__wbg_ptr, t);
            return S.__wrap(e);
        }
        rbSleep(t) {
            i.rawrigidbodyset_rbSleep(this.__wbg_ptr, t);
        }
        rbIsSleeping(t) {
            return i.rawrigidbodyset_rbIsSleeping(this.__wbg_ptr, t) !== 0;
        }
        rbIsMoving(t) {
            return i.rawrigidbodyset_rbIsMoving(this.__wbg_ptr, t) !== 0;
        }
        rbNextTranslation(t) {
            const e = i.rawrigidbodyset_rbNextTranslation(this.__wbg_ptr, t);
            return l.__wrap(e);
        }
        rbNextRotation(t) {
            const e = i.rawrigidbodyset_rbNextRotation(this.__wbg_ptr, t);
            return S.__wrap(e);
        }
        rbSetTranslation(t, e, r, n, a) {
            i.rawrigidbodyset_rbSetTranslation(this.__wbg_ptr, t, e, r, n, a);
        }
        rbSetRotation(t, e, r, n, a, o) {
            i.rawrigidbodyset_rbSetRotation(this.__wbg_ptr, t, e, r, n, a, o);
        }
        rbSetLinvel(t, e, r) {
            _(e, l), i.rawrigidbodyset_rbSetLinvel(this.__wbg_ptr, t, e.__wbg_ptr, r);
        }
        rbSetAngvel(t, e, r) {
            _(e, l), i.rawrigidbodyset_rbSetAngvel(this.__wbg_ptr, t, e.__wbg_ptr, r);
        }
        rbSetNextKinematicTranslation(t, e, r, n) {
            i.rawrigidbodyset_rbSetNextKinematicTranslation(this.__wbg_ptr, t, e, r, n);
        }
        rbSetNextKinematicRotation(t, e, r, n, a) {
            i.rawrigidbodyset_rbSetNextKinematicRotation(this.__wbg_ptr, t, e, r, n, a);
        }
        rbRecomputeMassPropertiesFromColliders(t, e) {
            _(e, A), i.rawrigidbodyset_rbRecomputeMassPropertiesFromColliders(this.__wbg_ptr, t, e.__wbg_ptr);
        }
        rbSetAdditionalMass(t, e, r) {
            i.rawrigidbodyset_rbSetAdditionalMass(this.__wbg_ptr, t, e, r);
        }
        rbSetAdditionalMassProperties(t, e, r, n, a, o) {
            _(r, l), _(n, l), _(a, S), i.rawrigidbodyset_rbSetAdditionalMassProperties(this.__wbg_ptr, t, e, r.__wbg_ptr, n.__wbg_ptr, a.__wbg_ptr, o);
        }
        rbLinvel(t) {
            const e = i.rawrigidbodyset_rbLinvel(this.__wbg_ptr, t);
            return l.__wrap(e);
        }
        rbAngvel(t) {
            const e = i.rawrigidbodyset_rbAngvel(this.__wbg_ptr, t);
            return l.__wrap(e);
        }
        rbVelocityAtPoint(t, e) {
            _(e, l);
            const r = i.rawrigidbodyset_rbVelocityAtPoint(this.__wbg_ptr, t, e.__wbg_ptr);
            return l.__wrap(r);
        }
        rbLockTranslations(t, e, r) {
            i.rawrigidbodyset_rbLockTranslations(this.__wbg_ptr, t, e, r);
        }
        rbSetEnabledTranslations(t, e, r, n, a) {
            i.rawrigidbodyset_rbSetEnabledTranslations(this.__wbg_ptr, t, e, r, n, a);
        }
        rbLockRotations(t, e, r) {
            i.rawrigidbodyset_rbLockRotations(this.__wbg_ptr, t, e, r);
        }
        rbSetEnabledRotations(t, e, r, n, a) {
            i.rawrigidbodyset_rbSetEnabledRotations(this.__wbg_ptr, t, e, r, n, a);
        }
        rbDominanceGroup(t) {
            return i.rawrigidbodyset_rbDominanceGroup(this.__wbg_ptr, t);
        }
        rbSetDominanceGroup(t, e) {
            i.rawrigidbodyset_rbSetDominanceGroup(this.__wbg_ptr, t, e);
        }
        rbEnableCcd(t, e) {
            i.rawrigidbodyset_rbEnableCcd(this.__wbg_ptr, t, e);
        }
        rbSetSoftCcdPrediction(t, e) {
            i.rawrigidbodyset_rbSetSoftCcdPrediction(this.__wbg_ptr, t, e);
        }
        rbMass(t) {
            return i.rawrigidbodyset_rbMass(this.__wbg_ptr, t);
        }
        rbInvMass(t) {
            return i.rawrigidbodyset_rbInvMass(this.__wbg_ptr, t);
        }
        rbEffectiveInvMass(t) {
            const e = i.rawrigidbodyset_rbEffectiveInvMass(this.__wbg_ptr, t);
            return l.__wrap(e);
        }
        rbLocalCom(t) {
            const e = i.rawrigidbodyset_rbLocalCom(this.__wbg_ptr, t);
            return l.__wrap(e);
        }
        rbWorldCom(t) {
            const e = i.rawrigidbodyset_rbWorldCom(this.__wbg_ptr, t);
            return l.__wrap(e);
        }
        rbInvPrincipalInertiaSqrt(t) {
            const e = i.rawrigidbodyset_rbInvPrincipalInertiaSqrt(this.__wbg_ptr, t);
            return l.__wrap(e);
        }
        rbPrincipalInertiaLocalFrame(t) {
            const e = i.rawrigidbodyset_rbPrincipalInertiaLocalFrame(this.__wbg_ptr, t);
            return S.__wrap(e);
        }
        rbPrincipalInertia(t) {
            const e = i.rawrigidbodyset_rbPrincipalInertia(this.__wbg_ptr, t);
            return l.__wrap(e);
        }
        rbEffectiveWorldInvInertiaSqrt(t) {
            const e = i.rawrigidbodyset_rbEffectiveWorldInvInertiaSqrt(this.__wbg_ptr, t);
            return vt.__wrap(e);
        }
        rbEffectiveAngularInertia(t) {
            const e = i.rawrigidbodyset_rbEffectiveAngularInertia(this.__wbg_ptr, t);
            return vt.__wrap(e);
        }
        rbWakeUp(t) {
            i.rawrigidbodyset_rbWakeUp(this.__wbg_ptr, t);
        }
        rbIsCcdEnabled(t) {
            return i.rawrigidbodyset_rbIsCcdEnabled(this.__wbg_ptr, t) !== 0;
        }
        rbSoftCcdPrediction(t) {
            return i.rawrigidbodyset_rbSoftCcdPrediction(this.__wbg_ptr, t);
        }
        rbNumColliders(t) {
            return i.rawrigidbodyset_rbNumColliders(this.__wbg_ptr, t) >>> 0;
        }
        rbCollider(t, e) {
            return i.rawrigidbodyset_rbCollider(this.__wbg_ptr, t, e);
        }
        rbBodyType(t) {
            return i.rawrigidbodyset_rbBodyType(this.__wbg_ptr, t);
        }
        rbSetBodyType(t, e, r) {
            i.rawrigidbodyset_rbSetBodyType(this.__wbg_ptr, t, e, r);
        }
        rbIsFixed(t) {
            return i.rawrigidbodyset_rbIsFixed(this.__wbg_ptr, t) !== 0;
        }
        rbIsKinematic(t) {
            return i.rawrigidbodyset_rbIsKinematic(this.__wbg_ptr, t) !== 0;
        }
        rbIsDynamic(t) {
            return i.rawrigidbodyset_rbIsDynamic(this.__wbg_ptr, t) !== 0;
        }
        rbLinearDamping(t) {
            return i.rawrigidbodyset_rbLinearDamping(this.__wbg_ptr, t);
        }
        rbAngularDamping(t) {
            return i.rawrigidbodyset_rbAngularDamping(this.__wbg_ptr, t);
        }
        rbSetLinearDamping(t, e) {
            i.rawrigidbodyset_rbSetLinearDamping(this.__wbg_ptr, t, e);
        }
        rbSetAngularDamping(t, e) {
            i.rawrigidbodyset_rbSetAngularDamping(this.__wbg_ptr, t, e);
        }
        rbSetEnabled(t, e) {
            i.rawrigidbodyset_rbSetEnabled(this.__wbg_ptr, t, e);
        }
        rbIsEnabled(t) {
            return i.rawrigidbodyset_rbIsEnabled(this.__wbg_ptr, t) !== 0;
        }
        rbGravityScale(t) {
            return i.rawrigidbodyset_rbGravityScale(this.__wbg_ptr, t);
        }
        rbSetGravityScale(t, e, r) {
            i.rawrigidbodyset_rbSetGravityScale(this.__wbg_ptr, t, e, r);
        }
        rbResetForces(t, e) {
            i.rawrigidbodyset_rbResetForces(this.__wbg_ptr, t, e);
        }
        rbResetTorques(t, e) {
            i.rawrigidbodyset_rbResetTorques(this.__wbg_ptr, t, e);
        }
        rbAddForce(t, e, r) {
            _(e, l), i.rawrigidbodyset_rbAddForce(this.__wbg_ptr, t, e.__wbg_ptr, r);
        }
        rbApplyImpulse(t, e, r) {
            _(e, l), i.rawrigidbodyset_rbApplyImpulse(this.__wbg_ptr, t, e.__wbg_ptr, r);
        }
        rbAddTorque(t, e, r) {
            _(e, l), i.rawrigidbodyset_rbAddTorque(this.__wbg_ptr, t, e.__wbg_ptr, r);
        }
        rbApplyTorqueImpulse(t, e, r) {
            _(e, l), i.rawrigidbodyset_rbApplyTorqueImpulse(this.__wbg_ptr, t, e.__wbg_ptr, r);
        }
        rbAddForceAtPoint(t, e, r, n) {
            _(e, l), _(r, l), i.rawrigidbodyset_rbAddForceAtPoint(this.__wbg_ptr, t, e.__wbg_ptr, r.__wbg_ptr, n);
        }
        rbApplyImpulseAtPoint(t, e, r, n) {
            _(e, l), _(r, l), i.rawrigidbodyset_rbApplyImpulseAtPoint(this.__wbg_ptr, t, e.__wbg_ptr, r.__wbg_ptr, n);
        }
        rbAdditionalSolverIterations(t) {
            return i.rawrigidbodyset_rbAdditionalSolverIterations(this.__wbg_ptr, t) >>> 0;
        }
        rbSetAdditionalSolverIterations(t, e) {
            i.rawrigidbodyset_rbSetAdditionalSolverIterations(this.__wbg_ptr, t, e);
        }
        rbUserData(t) {
            return i.rawrigidbodyset_rbUserData(this.__wbg_ptr, t) >>> 0;
        }
        rbSetUserData(t, e) {
            i.rawrigidbodyset_rbSetUserData(this.__wbg_ptr, t, e);
        }
        rbUserForce(t) {
            const e = i.rawrigidbodyset_rbUserForce(this.__wbg_ptr, t);
            return l.__wrap(e);
        }
        rbUserTorque(t) {
            const e = i.rawrigidbodyset_rbUserTorque(this.__wbg_ptr, t);
            return l.__wrap(e);
        }
        constructor(){
            const t = i.rawrigidbodyset_new();
            return this.__wbg_ptr = t >>> 0, Qt.register(this, this.__wbg_ptr, this), this;
        }
        createRigidBody(t, e, r, n, a, o, w, h, d, p, u, g, m, I, k, N, W, G, Q, Lt, Nt, Wt, Gt, Ot, bt, Bt) {
            return _(e, l), _(r, S), _(w, l), _(h, l), _(d, l), _(p, l), _(u, S), i.rawrigidbodyset_createRigidBody(this.__wbg_ptr, t, e.__wbg_ptr, r.__wbg_ptr, n, a, o, w.__wbg_ptr, h.__wbg_ptr, d.__wbg_ptr, p.__wbg_ptr, u.__wbg_ptr, g, m, I, k, N, W, G, Q, Lt, Nt, Wt, Gt, Ot, bt, Bt);
        }
        remove(t, e, r, n, a) {
            _(e, J), _(r, A), _(n, X), _(a, K), i.rawrigidbodyset_remove(this.__wbg_ptr, t, e.__wbg_ptr, r.__wbg_ptr, n.__wbg_ptr, a.__wbg_ptr);
        }
        len() {
            return i.rawcolliderset_len(this.__wbg_ptr) >>> 0;
        }
        contains(t) {
            return i.rawrigidbodyset_contains(this.__wbg_ptr, t) !== 0;
        }
        forEachRigidBodyHandle(t) {
            try {
                i.rawrigidbodyset_forEachRigidBodyHandle(this.__wbg_ptr, x(t));
            } finally{
                R[C++] = void 0;
            }
        }
        propagateModifiedBodyPositionsToColliders(t) {
            _(t, A), i.rawrigidbodyset_propagateModifiedBodyPositionsToColliders(this.__wbg_ptr, t.__wbg_ptr);
        }
    }
    const te = typeof FinalizationRegistry > "u" ? {
        register: ()=>{},
        unregister: ()=>{}
    } : new FinalizationRegistry((s)=>i.__wbg_rawrotation_free(s >>> 0, 1));
    class S {
        static __wrap(t) {
            t = t >>> 0;
            const e = Object.create(S.prototype);
            return e.__wbg_ptr = t, te.register(e, e.__wbg_ptr, e), e;
        }
        __destroy_into_raw() {
            const t = this.__wbg_ptr;
            return this.__wbg_ptr = 0, te.unregister(this), t;
        }
        free() {
            const t = this.__destroy_into_raw();
            i.__wbg_rawrotation_free(t, 0);
        }
        constructor(t, e, r, n){
            const a = i.rawrotation_new(t, e, r, n);
            return this.__wbg_ptr = a >>> 0, te.register(this, this.__wbg_ptr, this), this;
        }
        static identity() {
            const t = i.rawrotation_identity();
            return S.__wrap(t);
        }
        get x() {
            return i.rawrotation_x(this.__wbg_ptr);
        }
        get y() {
            return i.rawintegrationparameters_dt(this.__wbg_ptr);
        }
        get z() {
            return i.rawcollidershapecasthit_time_of_impact(this.__wbg_ptr);
        }
        get w() {
            return i.rawrotation_w(this.__wbg_ptr);
        }
    }
    const or = typeof FinalizationRegistry > "u" ? {
        register: ()=>{},
        unregister: ()=>{}
    } : new FinalizationRegistry((s)=>i.__wbg_rawsdpmatrix3_free(s >>> 0, 1));
    class vt {
        static __wrap(t) {
            t = t >>> 0;
            const e = Object.create(vt.prototype);
            return e.__wbg_ptr = t, or.register(e, e.__wbg_ptr, e), e;
        }
        __destroy_into_raw() {
            const t = this.__wbg_ptr;
            return this.__wbg_ptr = 0, or.unregister(this), t;
        }
        free() {
            const t = this.__destroy_into_raw();
            i.__wbg_rawsdpmatrix3_free(t, 0);
        }
        elements() {
            const t = i.rawsdpmatrix3_elements(this.__wbg_ptr);
            return lt(t);
        }
    }
    const _r = typeof FinalizationRegistry > "u" ? {
        register: ()=>{},
        unregister: ()=>{}
    } : new FinalizationRegistry((s)=>i.__wbg_rawserializationpipeline_free(s >>> 0, 1));
    class di {
        __destroy_into_raw() {
            const t = this.__wbg_ptr;
            return this.__wbg_ptr = 0, _r.unregister(this), t;
        }
        free() {
            const t = this.__destroy_into_raw();
            i.__wbg_rawserializationpipeline_free(t, 0);
        }
        constructor(){
            const t = i.rawserializationpipeline_new();
            return this.__wbg_ptr = t >>> 0, _r.register(this, this.__wbg_ptr, this), this;
        }
        serializeAll(t, e, r, n, a, o, w, h, d) {
            _(t, l), _(e, rt), _(r, J), _(n, et), _(a, Z), _(o, E), _(w, A), _(h, X), _(d, K);
            const p = i.rawserializationpipeline_serializeAll(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, n.__wbg_ptr, a.__wbg_ptr, o.__wbg_ptr, w.__wbg_ptr, h.__wbg_ptr, d.__wbg_ptr);
            return lt(p);
        }
        deserializeAll(t) {
            const e = i.rawserializationpipeline_deserializeAll(this.__wbg_ptr, z(t));
            return e === 0 ? void 0 : me.__wrap(e);
        }
    }
    const lr = typeof FinalizationRegistry > "u" ? {
        register: ()=>{},
        unregister: ()=>{}
    } : new FinalizationRegistry((s)=>i.__wbg_rawshape_free(s >>> 0, 1));
    class b {
        static __wrap(t) {
            t = t >>> 0;
            const e = Object.create(b.prototype);
            return e.__wbg_ptr = t, lr.register(e, e.__wbg_ptr, e), e;
        }
        __destroy_into_raw() {
            const t = this.__wbg_ptr;
            return this.__wbg_ptr = 0, lr.unregister(this), t;
        }
        free() {
            const t = this.__destroy_into_raw();
            i.__wbg_rawshape_free(t, 0);
        }
        static cuboid(t, e, r) {
            const n = i.rawshape_cuboid(t, e, r);
            return b.__wrap(n);
        }
        static roundCuboid(t, e, r, n) {
            const a = i.rawshape_roundCuboid(t, e, r, n);
            return b.__wrap(a);
        }
        static ball(t) {
            const e = i.rawshape_ball(t);
            return b.__wrap(e);
        }
        static halfspace(t) {
            _(t, l);
            const e = i.rawshape_halfspace(t.__wbg_ptr);
            return b.__wrap(e);
        }
        static capsule(t, e) {
            const r = i.rawshape_capsule(t, e);
            return b.__wrap(r);
        }
        static cylinder(t, e) {
            const r = i.rawshape_cylinder(t, e);
            return b.__wrap(r);
        }
        static roundCylinder(t, e, r) {
            const n = i.rawshape_roundCylinder(t, e, r);
            return b.__wrap(n);
        }
        static cone(t, e) {
            const r = i.rawshape_cone(t, e);
            return b.__wrap(r);
        }
        static roundCone(t, e, r) {
            const n = i.rawshape_roundCone(t, e, r);
            return b.__wrap(n);
        }
        static voxels(t, e) {
            _(t, l);
            const r = ot(e, i.__wbindgen_export_2), n = L, a = i.rawshape_voxels(t.__wbg_ptr, r, n);
            return b.__wrap(a);
        }
        static voxelsFromPoints(t, e) {
            _(t, l);
            const r = Y(e, i.__wbindgen_export_2), n = L, a = i.rawshape_voxelsFromPoints(t.__wbg_ptr, r, n);
            return b.__wrap(a);
        }
        static polyline(t, e) {
            const r = Y(t, i.__wbindgen_export_2), n = L, a = ot(e, i.__wbindgen_export_2), o = L, w = i.rawshape_polyline(r, n, a, o);
            return b.__wrap(w);
        }
        static trimesh(t, e, r) {
            const n = Y(t, i.__wbindgen_export_2), a = L, o = ot(e, i.__wbindgen_export_2), w = L, h = i.rawshape_trimesh(n, a, o, w, r);
            return h === 0 ? void 0 : b.__wrap(h);
        }
        static heightfield(t, e, r, n, a) {
            const o = Y(r, i.__wbindgen_export_2), w = L;
            _(n, l);
            const h = i.rawshape_heightfield(t, e, o, w, n.__wbg_ptr, a);
            return b.__wrap(h);
        }
        static segment(t, e) {
            _(t, l), _(e, l);
            const r = i.rawshape_segment(t.__wbg_ptr, e.__wbg_ptr);
            return b.__wrap(r);
        }
        static triangle(t, e, r) {
            _(t, l), _(e, l), _(r, l);
            const n = i.rawshape_triangle(t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr);
            return b.__wrap(n);
        }
        static roundTriangle(t, e, r, n) {
            _(t, l), _(e, l), _(r, l);
            const a = i.rawshape_roundTriangle(t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, n);
            return b.__wrap(a);
        }
        static convexHull(t) {
            const e = Y(t, i.__wbindgen_export_2), r = L, n = i.rawshape_convexHull(e, r);
            return n === 0 ? void 0 : b.__wrap(n);
        }
        static roundConvexHull(t, e) {
            const r = Y(t, i.__wbindgen_export_2), n = L, a = i.rawshape_roundConvexHull(r, n, e);
            return a === 0 ? void 0 : b.__wrap(a);
        }
        static convexMesh(t, e) {
            const r = Y(t, i.__wbindgen_export_2), n = L, a = ot(e, i.__wbindgen_export_2), o = L, w = i.rawshape_convexMesh(r, n, a, o);
            return w === 0 ? void 0 : b.__wrap(w);
        }
        static roundConvexMesh(t, e, r) {
            const n = Y(t, i.__wbindgen_export_2), a = L, o = ot(e, i.__wbindgen_export_2), w = L, h = i.rawshape_roundConvexMesh(n, a, o, w, r);
            return h === 0 ? void 0 : b.__wrap(h);
        }
        castShape(t, e, r, n, a, o, w, h, d, p) {
            _(t, l), _(e, S), _(r, l), _(n, b), _(a, l), _(o, S), _(w, l);
            const u = i.rawshape_castShape(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, n.__wbg_ptr, a.__wbg_ptr, o.__wbg_ptr, w.__wbg_ptr, h, d, p);
            return u === 0 ? void 0 : Mt.__wrap(u);
        }
        intersectsShape(t, e, r, n, a) {
            return _(t, l), _(e, S), _(r, b), _(n, l), _(a, S), i.rawshape_intersectsShape(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, n.__wbg_ptr, a.__wbg_ptr) !== 0;
        }
        contactShape(t, e, r, n, a, o) {
            _(t, l), _(e, S), _(r, b), _(n, l), _(a, S);
            const w = i.rawshape_contactShape(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, n.__wbg_ptr, a.__wbg_ptr, o);
            return w === 0 ? void 0 : ct.__wrap(w);
        }
        containsPoint(t, e, r) {
            return _(t, l), _(e, S), _(r, l), i.rawshape_containsPoint(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr) !== 0;
        }
        projectPoint(t, e, r, n) {
            _(t, l), _(e, S), _(r, l);
            const a = i.rawshape_projectPoint(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, n);
            return Ft.__wrap(a);
        }
        intersectsRay(t, e, r, n, a) {
            return _(t, l), _(e, S), _(r, l), _(n, l), i.rawshape_intersectsRay(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, n.__wbg_ptr, a) !== 0;
        }
        castRay(t, e, r, n, a, o) {
            return _(t, l), _(e, S), _(r, l), _(n, l), i.rawshape_castRay(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, n.__wbg_ptr, a, o);
        }
        castRayAndGetNormal(t, e, r, n, a, o) {
            _(t, l), _(e, S), _(r, l), _(n, l);
            const w = i.rawshape_castRayAndGetNormal(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, n.__wbg_ptr, a, o);
            return w === 0 ? void 0 : Tt.__wrap(w);
        }
    }
    const cr = typeof FinalizationRegistry > "u" ? {
        register: ()=>{},
        unregister: ()=>{}
    } : new FinalizationRegistry((s)=>i.__wbg_rawshapecasthit_free(s >>> 0, 1));
    class Mt {
        static __wrap(t) {
            t = t >>> 0;
            const e = Object.create(Mt.prototype);
            return e.__wbg_ptr = t, cr.register(e, e.__wbg_ptr, e), e;
        }
        __destroy_into_raw() {
            const t = this.__wbg_ptr;
            return this.__wbg_ptr = 0, cr.unregister(this), t;
        }
        free() {
            const t = this.__destroy_into_raw();
            i.__wbg_rawshapecasthit_free(t, 0);
        }
        time_of_impact() {
            return i.rawrotation_x(this.__wbg_ptr);
        }
        witness1() {
            const t = i.rawshapecasthit_witness1(this.__wbg_ptr);
            return l.__wrap(t);
        }
        witness2() {
            const t = i.rawcontactforceevent_total_force(this.__wbg_ptr);
            return l.__wrap(t);
        }
        normal1() {
            const t = i.rawshapecasthit_normal1(this.__wbg_ptr);
            return l.__wrap(t);
        }
        normal2() {
            const t = i.rawshapecasthit_normal2(this.__wbg_ptr);
            return l.__wrap(t);
        }
    }
    const wr = typeof FinalizationRegistry > "u" ? {
        register: ()=>{},
        unregister: ()=>{}
    } : new FinalizationRegistry((s)=>i.__wbg_rawshapecontact_free(s >>> 0, 1));
    class ct {
        static __wrap(t) {
            t = t >>> 0;
            const e = Object.create(ct.prototype);
            return e.__wbg_ptr = t, wr.register(e, e.__wbg_ptr, e), e;
        }
        __destroy_into_raw() {
            const t = this.__wbg_ptr;
            return this.__wbg_ptr = 0, wr.unregister(this), t;
        }
        free() {
            const t = this.__destroy_into_raw();
            i.__wbg_rawshapecontact_free(t, 0);
        }
        distance() {
            return i.rawkinematiccharactercontroller_maxSlopeClimbAngle(this.__wbg_ptr);
        }
        point1() {
            const t = i.rawpointprojection_point(this.__wbg_ptr);
            return l.__wrap(t);
        }
        point2() {
            const t = i.rawcollidershapecasthit_witness1(this.__wbg_ptr);
            return l.__wrap(t);
        }
        normal1() {
            const t = i.rawcollidershapecasthit_witness2(this.__wbg_ptr);
            return l.__wrap(t);
        }
        normal2() {
            const t = i.rawcharactercollision_translationDeltaApplied(this.__wbg_ptr);
            return l.__wrap(t);
        }
    }
    const ee = typeof FinalizationRegistry > "u" ? {
        register: ()=>{},
        unregister: ()=>{}
    } : new FinalizationRegistry((s)=>i.__wbg_rawvector_free(s >>> 0, 1));
    class l {
        static __wrap(t) {
            t = t >>> 0;
            const e = Object.create(l.prototype);
            return e.__wbg_ptr = t, ee.register(e, e.__wbg_ptr, e), e;
        }
        __destroy_into_raw() {
            const t = this.__wbg_ptr;
            return this.__wbg_ptr = 0, ee.unregister(this), t;
        }
        free() {
            const t = this.__destroy_into_raw();
            i.__wbg_rawvector_free(t, 0);
        }
        static zero() {
            const t = i.rawvector_zero();
            return l.__wrap(t);
        }
        constructor(t, e, r){
            const n = i.rawvector_new(t, e, r);
            return this.__wbg_ptr = n >>> 0, ee.register(this, this.__wbg_ptr, this), this;
        }
        get x() {
            return i.rawrotation_x(this.__wbg_ptr);
        }
        set x(t) {
            i.rawvector_set_x(this.__wbg_ptr, t);
        }
        get y() {
            return i.rawintegrationparameters_dt(this.__wbg_ptr);
        }
        set y(t) {
            i.rawintegrationparameters_set_dt(this.__wbg_ptr, t);
        }
        get z() {
            return i.rawcollidershapecasthit_time_of_impact(this.__wbg_ptr);
        }
        set z(t) {
            i.rawvector_set_z(this.__wbg_ptr, t);
        }
        xyz() {
            const t = i.rawvector_xyz(this.__wbg_ptr);
            return l.__wrap(t);
        }
        yxz() {
            const t = i.rawvector_yxz(this.__wbg_ptr);
            return l.__wrap(t);
        }
        zxy() {
            const t = i.rawvector_zxy(this.__wbg_ptr);
            return l.__wrap(t);
        }
        xzy() {
            const t = i.rawvector_xzy(this.__wbg_ptr);
            return l.__wrap(t);
        }
        yzx() {
            const t = i.rawvector_yzx(this.__wbg_ptr);
            return l.__wrap(t);
        }
        zyx() {
            const t = i.rawvector_zyx(this.__wbg_ptr);
            return l.__wrap(t);
        }
    }
    function pi(s, t, e, r) {
        const n = v(s).bind(v(t), v(e), v(r));
        return z(n);
    }
    function ui(s) {
        const t = v(s).buffer;
        return z(t);
    }
    function gi() {
        return ue(function(s, t, e) {
            const r = v(s).call(v(t), v(e));
            return z(r);
        }, arguments);
    }
    function bi() {
        return ue(function(s, t, e, r) {
            const n = v(s).call(v(t), v(e), v(r));
            return z(n);
        }, arguments);
    }
    function fi() {
        return ue(function(s, t, e, r, n) {
            const a = v(s).call(v(t), v(e), v(r), v(n));
            return z(a);
        }, arguments);
    }
    function mi(s) {
        return v(s).length;
    }
    function yi(s) {
        return v(s).length;
    }
    function Si(s) {
        const t = new Uint8Array(v(s));
        return z(t);
    }
    function Ri(s, t, e) {
        const r = new Uint8Array(v(s), t >>> 0, e >>> 0);
        return z(r);
    }
    function vi(s, t, e) {
        const r = new Float32Array(v(s), t >>> 0, e >>> 0);
        return z(r);
    }
    function Ci(s) {
        const t = new Float32Array(s >>> 0);
        return z(t);
    }
    function Ii(s) {
        const t = ge.__wrap(s);
        return z(t);
    }
    function xi(s) {
        const t = zt.__wrap(s);
        return z(t);
    }
    function Ei(s, t, e) {
        v(s).set(v(t), e >>> 0);
    }
    function Ai(s, t, e) {
        v(s).set(v(t), e >>> 0);
    }
    function Pi(s) {
        const t = v(s);
        return typeof t == "boolean" ? t ? 1 : 0 : 2;
    }
    function ji(s) {
        return typeof v(s) == "function";
    }
    function Fi() {
        const s = i.memory;
        return z(s);
    }
    function zi(s, t) {
        const e = v(t), r = typeof e == "number" ? e : void 0;
        F().setFloat64(s + 8, f(r) ? 0 : r, !0), F().setInt32(s + 0, !f(r), !0);
    }
    function Ti(s) {
        return z(s);
    }
    function Mi(s) {
        lt(s);
    }
    function Di(s, t) {
        throw new Error(dr(s, t));
    }
    URL = globalThis.URL;
    const Hi = await $r({
        "./rapier_wasm3d_bg.js": {
            __wbindgen_number_new: Ti,
            __wbindgen_boolean_get: Pi,
            __wbindgen_object_drop_ref: Mi,
            __wbindgen_number_get: zi,
            __wbindgen_is_function: ji,
            __wbg_rawraycolliderintersection_new: xi,
            __wbg_rawcontactforceevent_new: Ii,
            __wbg_call_7cccdd69e0791ae2: gi,
            __wbg_call_833bed5770ea2041: bi,
            __wbg_call_b8adc8b1d0a0d8eb: fi,
            __wbg_bind_c8359b1cba058168: pi,
            __wbg_buffer_609cc3eee51ed158: ui,
            __wbg_newwithbyteoffsetandlength_d97e637ebe145a9a: Ri,
            __wbg_new_a12002a7f91c75be: Si,
            __wbg_set_65595bdd868b3009: Ai,
            __wbg_length_a446193dc22c12f8: yi,
            __wbg_newwithbyteoffsetandlength_e6b7e69acd4c7354: vi,
            __wbg_set_10bad9bee0e9c58b: Ei,
            __wbg_length_3b4f022188ae8db6: mi,
            __wbg_newwithlength_5a5efe313cfd59f1: Ci,
            __wbindgen_throw: Di,
            __wbindgen_memory: Fi
        }
    }, Zr), { memory: ki, version: Li, __wbg_rawkinematiccharactercontroller_free: Ni, rawkinematiccharactercontroller_new: Wi, rawkinematiccharactercontroller_setUp: Gi, rawkinematiccharactercontroller_normalNudgeFactor: Oi, rawkinematiccharactercontroller_setNormalNudgeFactor: Bi, rawkinematiccharactercontroller_setOffset: qi, rawkinematiccharactercontroller_slideEnabled: Vi, rawkinematiccharactercontroller_setSlideEnabled: Ui, rawkinematiccharactercontroller_autostepMaxHeight: Xi, rawkinematiccharactercontroller_autostepMinWidth: Ji, rawkinematiccharactercontroller_autostepIncludesDynamicBodies: Ki, rawkinematiccharactercontroller_autostepEnabled: Yi, rawkinematiccharactercontroller_enableAutostep: Zi, rawkinematiccharactercontroller_disableAutostep: $i, rawkinematiccharactercontroller_maxSlopeClimbAngle: Qi, rawkinematiccharactercontroller_setMaxSlopeClimbAngle: tn, rawkinematiccharactercontroller_minSlopeSlideAngle: en, rawkinematiccharactercontroller_setMinSlopeSlideAngle: rn, rawkinematiccharactercontroller_snapToGroundDistance: nn, rawkinematiccharactercontroller_enableSnapToGround: sn, rawkinematiccharactercontroller_disableSnapToGround: an, rawkinematiccharactercontroller_snapToGroundEnabled: on, rawkinematiccharactercontroller_computeColliderMovement: _n, rawkinematiccharactercontroller_computedMovement: ln, rawkinematiccharactercontroller_computedGrounded: cn, rawkinematiccharactercontroller_numComputedCollisions: wn, rawkinematiccharactercontroller_computedCollision: hn, __wbg_rawcharactercollision_free: dn, rawcharactercollision_new: pn, rawcharactercollision_handle: un, rawcharactercollision_translationDeltaApplied: gn, rawcharactercollision_translationDeltaRemaining: bn, rawcharactercollision_toi: fn, rawcharactercollision_worldWitness1: mn, rawcharactercollision_worldWitness2: yn, rawcharactercollision_worldNormal1: Sn, rawcharactercollision_worldNormal2: Rn, __wbg_rawpidcontroller_free: vn, rawpidcontroller_new: Cn, rawpidcontroller_set_kp: In, rawpidcontroller_set_ki: xn, rawpidcontroller_set_kd: En, rawpidcontroller_set_axes_mask: An, rawpidcontroller_reset_integrals: Pn, rawpidcontroller_apply_linear_correction: jn, rawpidcontroller_apply_angular_correction: Fn, rawpidcontroller_linear_correction: zn, rawpidcontroller_angular_correction: Tn, __wbg_rawdynamicraycastvehiclecontroller_free: Mn, rawdynamicraycastvehiclecontroller_new: Dn, rawdynamicraycastvehiclecontroller_current_vehicle_speed: Hn, rawdynamicraycastvehiclecontroller_chassis: kn, rawdynamicraycastvehiclecontroller_index_up_axis: Ln, rawdynamicraycastvehiclecontroller_set_index_up_axis: Nn, rawdynamicraycastvehiclecontroller_index_forward_axis: Wn, rawdynamicraycastvehiclecontroller_set_index_forward_axis: Gn, rawdynamicraycastvehiclecontroller_add_wheel: On, rawdynamicraycastvehiclecontroller_num_wheels: Bn, rawdynamicraycastvehiclecontroller_update_vehicle: qn, rawdynamicraycastvehiclecontroller_wheel_chassis_connection_point_cs: Vn, rawdynamicraycastvehiclecontroller_set_wheel_chassis_connection_point_cs: Un, rawdynamicraycastvehiclecontroller_wheel_suspension_rest_length: Xn, rawdynamicraycastvehiclecontroller_set_wheel_suspension_rest_length: Jn, rawdynamicraycastvehiclecontroller_wheel_max_suspension_travel: Kn, rawdynamicraycastvehiclecontroller_set_wheel_max_suspension_travel: Yn, rawdynamicraycastvehiclecontroller_wheel_radius: Zn, rawdynamicraycastvehiclecontroller_set_wheel_radius: $n, rawdynamicraycastvehiclecontroller_wheel_suspension_stiffness: Qn, rawdynamicraycastvehiclecontroller_set_wheel_suspension_stiffness: ts, rawdynamicraycastvehiclecontroller_wheel_suspension_compression: es, rawdynamicraycastvehiclecontroller_set_wheel_suspension_compression: rs, rawdynamicraycastvehiclecontroller_wheel_suspension_relaxation: is, rawdynamicraycastvehiclecontroller_set_wheel_suspension_relaxation: ns, rawdynamicraycastvehiclecontroller_wheel_max_suspension_force: ss, rawdynamicraycastvehiclecontroller_set_wheel_max_suspension_force: as, rawdynamicraycastvehiclecontroller_wheel_brake: os, rawdynamicraycastvehiclecontroller_set_wheel_brake: _s, rawdynamicraycastvehiclecontroller_wheel_steering: ls, rawdynamicraycastvehiclecontroller_set_wheel_steering: cs, rawdynamicraycastvehiclecontroller_wheel_engine_force: ws, rawdynamicraycastvehiclecontroller_set_wheel_engine_force: hs, rawdynamicraycastvehiclecontroller_wheel_direction_cs: ds, rawdynamicraycastvehiclecontroller_set_wheel_direction_cs: ps, rawdynamicraycastvehiclecontroller_wheel_axle_cs: us, rawdynamicraycastvehiclecontroller_set_wheel_axle_cs: gs, rawdynamicraycastvehiclecontroller_wheel_friction_slip: bs, rawdynamicraycastvehiclecontroller_set_wheel_friction_slip: fs, rawdynamicraycastvehiclecontroller_wheel_side_friction_stiffness: ms, rawdynamicraycastvehiclecontroller_set_wheel_side_friction_stiffness: ys, rawdynamicraycastvehiclecontroller_wheel_rotation: Ss, rawdynamicraycastvehiclecontroller_wheel_forward_impulse: Rs, rawdynamicraycastvehiclecontroller_wheel_side_impulse: vs, rawdynamicraycastvehiclecontroller_wheel_suspension_force: Cs, rawdynamicraycastvehiclecontroller_wheel_contact_normal_ws: Is, rawdynamicraycastvehiclecontroller_wheel_contact_point_ws: xs, rawdynamicraycastvehiclecontroller_wheel_suspension_length: Es, rawdynamicraycastvehiclecontroller_wheel_hard_point_ws: As, rawdynamicraycastvehiclecontroller_wheel_is_in_contact: Ps, rawdynamicraycastvehiclecontroller_wheel_ground_object: js, __wbg_rawccdsolver_free: Fs, rawccdsolver_new: zs, rawimpulsejointset_jointType: Ts, rawimpulsejointset_jointBodyHandle1: Ms, rawimpulsejointset_jointBodyHandle2: Ds, rawimpulsejointset_jointFrameX1: Hs, rawimpulsejointset_jointFrameX2: ks, rawimpulsejointset_jointAnchor1: Ls, rawimpulsejointset_jointAnchor2: Ns, rawimpulsejointset_jointSetAnchor1: Ws, rawimpulsejointset_jointSetAnchor2: Gs, rawimpulsejointset_jointContactsEnabled: Os, rawimpulsejointset_jointSetContactsEnabled: Bs, rawimpulsejointset_jointLimitsEnabled: qs, rawimpulsejointset_jointLimitsMin: Vs, rawimpulsejointset_jointLimitsMax: Us, rawimpulsejointset_jointSetLimits: Xs, rawimpulsejointset_jointConfigureMotorModel: Js, rawimpulsejointset_jointConfigureMotorVelocity: Ks, rawimpulsejointset_jointConfigureMotorPosition: Ys, rawimpulsejointset_jointConfigureMotor: Zs, __wbg_rawimpulsejointset_free: $s, rawimpulsejointset_new: Qs, rawimpulsejointset_createJoint: ta, rawimpulsejointset_remove: ea, rawimpulsejointset_len: ra, rawimpulsejointset_contains: ia, rawimpulsejointset_forEachJointHandle: na, rawimpulsejointset_forEachJointAttachedToRigidBody: sa, __wbg_rawintegrationparameters_free: aa, rawintegrationparameters_new: oa, rawintegrationparameters_dt: _a, rawintegrationparameters_contact_erp: la, rawintegrationparameters_numSolverIterations: ca, rawintegrationparameters_minIslandSize: wa, rawintegrationparameters_maxCcdSubsteps: ha, rawintegrationparameters_lengthUnit: da, rawintegrationparameters_set_dt: pa, rawintegrationparameters_set_contact_natural_frequency: ua, rawintegrationparameters_set_normalizedAllowedLinearError: ga, rawintegrationparameters_set_normalizedPredictionDistance: ba, rawintegrationparameters_set_numSolverIterations: fa, rawintegrationparameters_set_minIslandSize: ma, rawintegrationparameters_set_maxCcdSubsteps: ya, rawintegrationparameters_set_lengthUnit: Sa, rawintegrationparameters_switchToStandardPgsSolver: Ra, rawintegrationparameters_switchToSmallStepsPgsSolver: va, rawintegrationparameters_switchToSmallStepsPgsSolverWithoutWarmstart: Ca, __wbg_rawislandmanager_free: Ia, rawislandmanager_new: xa, rawislandmanager_forEachActiveRigidBodyHandle: Ea, __wbg_rawgenericjoint_free: Aa, rawgenericjoint_generic: Pa, rawgenericjoint_spring: ja, rawgenericjoint_rope: Fa, rawgenericjoint_spherical: za, rawgenericjoint_prismatic: Ta, rawgenericjoint_fixed: Ma, rawgenericjoint_revolute: Da, rawmultibodyjointset_jointType: Ha, rawmultibodyjointset_jointFrameX1: ka, rawmultibodyjointset_jointFrameX2: La, rawmultibodyjointset_jointAnchor1: Na, rawmultibodyjointset_jointAnchor2: Wa, rawmultibodyjointset_jointContactsEnabled: Ga, rawmultibodyjointset_jointSetContactsEnabled: Oa, rawmultibodyjointset_jointLimitsEnabled: Ba, rawmultibodyjointset_jointLimitsMin: qa, rawmultibodyjointset_jointLimitsMax: Va, __wbg_rawmultibodyjointset_free: Ua, rawmultibodyjointset_new: Xa, rawmultibodyjointset_createJoint: Ja, rawmultibodyjointset_remove: Ka, rawmultibodyjointset_contains: Ya, rawmultibodyjointset_forEachJointHandle: Za, rawmultibodyjointset_forEachJointAttachedToRigidBody: $a, rawrigidbodyset_rbTranslation: Qa, rawrigidbodyset_rbRotation: to, rawrigidbodyset_rbSleep: eo, rawrigidbodyset_rbIsSleeping: ro, rawrigidbodyset_rbIsMoving: io, rawrigidbodyset_rbNextTranslation: no, rawrigidbodyset_rbNextRotation: so, rawrigidbodyset_rbSetTranslation: ao, rawrigidbodyset_rbSetRotation: oo, rawrigidbodyset_rbSetLinvel: _o, rawrigidbodyset_rbSetAngvel: lo, rawrigidbodyset_rbSetNextKinematicTranslation: co, rawrigidbodyset_rbSetNextKinematicRotation: wo, rawrigidbodyset_rbRecomputeMassPropertiesFromColliders: ho, rawrigidbodyset_rbSetAdditionalMass: po, rawrigidbodyset_rbSetAdditionalMassProperties: uo, rawrigidbodyset_rbLinvel: go, rawrigidbodyset_rbAngvel: bo, rawrigidbodyset_rbVelocityAtPoint: fo, rawrigidbodyset_rbLockTranslations: mo, rawrigidbodyset_rbSetEnabledTranslations: yo, rawrigidbodyset_rbLockRotations: So, rawrigidbodyset_rbSetEnabledRotations: Ro, rawrigidbodyset_rbDominanceGroup: vo, rawrigidbodyset_rbSetDominanceGroup: Co, rawrigidbodyset_rbEnableCcd: Io, rawrigidbodyset_rbSetSoftCcdPrediction: xo, rawrigidbodyset_rbMass: Eo, rawrigidbodyset_rbInvMass: Ao, rawrigidbodyset_rbEffectiveInvMass: Po, rawrigidbodyset_rbLocalCom: jo, rawrigidbodyset_rbWorldCom: Fo, rawrigidbodyset_rbInvPrincipalInertiaSqrt: zo, rawrigidbodyset_rbPrincipalInertiaLocalFrame: To, rawrigidbodyset_rbPrincipalInertia: Mo, rawrigidbodyset_rbEffectiveWorldInvInertiaSqrt: Do, rawrigidbodyset_rbEffectiveAngularInertia: Ho, rawrigidbodyset_rbWakeUp: ko, rawrigidbodyset_rbIsCcdEnabled: Lo, rawrigidbodyset_rbSoftCcdPrediction: No, rawrigidbodyset_rbNumColliders: Wo, rawrigidbodyset_rbCollider: Go, rawrigidbodyset_rbBodyType: Oo, rawrigidbodyset_rbSetBodyType: Bo, rawrigidbodyset_rbIsFixed: qo, rawrigidbodyset_rbIsKinematic: Vo, rawrigidbodyset_rbIsDynamic: Uo, rawrigidbodyset_rbLinearDamping: Xo, rawrigidbodyset_rbAngularDamping: Jo, rawrigidbodyset_rbSetLinearDamping: Ko, rawrigidbodyset_rbSetAngularDamping: Yo, rawrigidbodyset_rbSetEnabled: Zo, rawrigidbodyset_rbIsEnabled: $o, rawrigidbodyset_rbGravityScale: Qo, rawrigidbodyset_rbSetGravityScale: t_, rawrigidbodyset_rbResetForces: e_, rawrigidbodyset_rbResetTorques: r_, rawrigidbodyset_rbAddForce: i_, rawrigidbodyset_rbApplyImpulse: n_, rawrigidbodyset_rbAddTorque: s_, rawrigidbodyset_rbApplyTorqueImpulse: a_, rawrigidbodyset_rbAddForceAtPoint: o_, rawrigidbodyset_rbApplyImpulseAtPoint: __, rawrigidbodyset_rbAdditionalSolverIterations: l_, rawrigidbodyset_rbSetAdditionalSolverIterations: c_, rawrigidbodyset_rbUserData: w_, rawrigidbodyset_rbSetUserData: h_, rawrigidbodyset_rbUserForce: d_, rawrigidbodyset_rbUserTorque: p_, __wbg_rawrigidbodyset_free: u_, rawrigidbodyset_new: g_, rawrigidbodyset_createRigidBody: b_, rawrigidbodyset_remove: f_, rawrigidbodyset_contains: m_, rawrigidbodyset_forEachRigidBodyHandle: y_, rawrigidbodyset_propagateModifiedBodyPositionsToColliders: S_, __wbg_rawbroadphase_free: R_, rawbroadphase_new: v_, rawcolliderset_coTranslation: C_, rawcolliderset_coRotation: I_, rawcolliderset_coSetTranslation: x_, rawcolliderset_coSetTranslationWrtParent: E_, rawcolliderset_coSetRotation: A_, rawcolliderset_coSetRotationWrtParent: P_, rawcolliderset_coIsSensor: j_, rawcolliderset_coShapeType: F_, rawcolliderset_coHalfspaceNormal: z_, rawcolliderset_coHalfExtents: T_, rawcolliderset_coSetHalfExtents: M_, rawcolliderset_coRadius: D_, rawcolliderset_coSetRadius: H_, rawcolliderset_coHalfHeight: k_, rawcolliderset_coSetHalfHeight: L_, rawcolliderset_coRoundRadius: N_, rawcolliderset_coSetRoundRadius: W_, rawcolliderset_coVoxelData: G_, rawcolliderset_coVoxelSize: O_, rawcolliderset_coSetVoxel: B_, rawcolliderset_coPropagateVoxelChange: q_, rawcolliderset_coCombineVoxelStates: V_, rawcolliderset_coVertices: U_, rawcolliderset_coIndices: X_, rawcolliderset_coTriMeshFlags: J_, rawcolliderset_coHeightFieldFlags: K_, rawcolliderset_coHeightfieldHeights: Y_, rawcolliderset_coHeightfieldScale: Z_, rawcolliderset_coHeightfieldNRows: $_, rawcolliderset_coHeightfieldNCols: Q_, rawcolliderset_coParent: tl, rawcolliderset_coSetEnabled: el, rawcolliderset_coIsEnabled: rl, rawcolliderset_coSetContactSkin: il, rawcolliderset_coContactSkin: nl, rawcolliderset_coFriction: sl, rawcolliderset_coRestitution: al, rawcolliderset_coDensity: ol, rawcolliderset_coMass: _l, rawcolliderset_coVolume: ll, rawcolliderset_coCollisionGroups: cl, rawcolliderset_coSolverGroups: wl, rawcolliderset_coActiveHooks: hl, rawcolliderset_coActiveCollisionTypes: dl, rawcolliderset_coActiveEvents: pl, rawcolliderset_coContactForceEventThreshold: ul, rawcolliderset_coContainsPoint: gl, rawcolliderset_coCastShape: bl, rawcolliderset_coCastCollider: fl, rawcolliderset_coIntersectsShape: ml, rawcolliderset_coContactShape: yl, rawcolliderset_coContactCollider: Sl, rawcolliderset_coProjectPoint: Rl, rawcolliderset_coIntersectsRay: vl, rawcolliderset_coCastRay: Cl, rawcolliderset_coCastRayAndGetNormal: Il, rawcolliderset_coSetSensor: xl, rawcolliderset_coSetRestitution: El, rawcolliderset_coSetFriction: Al, rawcolliderset_coFrictionCombineRule: Pl, rawcolliderset_coSetFrictionCombineRule: jl, rawcolliderset_coRestitutionCombineRule: Fl, rawcolliderset_coSetRestitutionCombineRule: zl, rawcolliderset_coSetCollisionGroups: Tl, rawcolliderset_coSetSolverGroups: Ml, rawcolliderset_coSetActiveHooks: Dl, rawcolliderset_coSetActiveEvents: Hl, rawcolliderset_coSetActiveCollisionTypes: kl, rawcolliderset_coSetShape: Ll, rawcolliderset_coSetContactForceEventThreshold: Nl, rawcolliderset_coSetDensity: Wl, rawcolliderset_coSetMass: Gl, rawcolliderset_coSetMassProperties: Ol, __wbg_rawcolliderset_free: Bl, rawcolliderset_new: ql, rawcolliderset_len: Vl, rawcolliderset_contains: Ul, rawcolliderset_createCollider: Xl, rawcolliderset_remove: Jl, rawcolliderset_forEachColliderHandle: Kl, __wbg_rawshapecontact_free: Yl, __wbg_rawnarrowphase_free: Zl, rawnarrowphase_new: $l, rawnarrowphase_contact_pairs_with: Ql, rawnarrowphase_contact_pair: tc, rawnarrowphase_intersection_pairs_with: ec, rawnarrowphase_intersection_pair: rc, __wbg_rawcontactmanifold_free: ic, rawcontactpair_collider1: nc, rawcontactpair_collider2: sc, rawcontactpair_numContactManifolds: ac, rawcontactpair_contactManifold: oc, rawcontactmanifold_normal: _c, rawcontactmanifold_local_n1: lc, rawcontactmanifold_local_n2: cc, rawcontactmanifold_subshape1: wc, rawcontactmanifold_subshape2: hc, rawcontactmanifold_num_contacts: dc, rawcontactmanifold_contact_local_p1: pc, rawcontactmanifold_contact_local_p2: uc, rawcontactmanifold_contact_dist: gc, rawcontactmanifold_contact_fid1: bc, rawcontactmanifold_contact_fid2: fc, rawcontactmanifold_contact_impulse: mc, rawcontactmanifold_contact_tangent_impulse_x: yc, rawcontactmanifold_contact_tangent_impulse_y: Sc, rawcontactmanifold_num_solver_contacts: Rc, rawcontactmanifold_solver_contact_point: vc, rawcontactmanifold_solver_contact_dist: Cc, rawcontactmanifold_solver_contact_friction: Ic, rawcontactmanifold_solver_contact_restitution: xc, rawcontactmanifold_solver_contact_tangent_velocity: Ec, __wbg_rawpointprojection_free: Ac, rawpointprojection_point: Pc, rawpointprojection_isInside: jc, __wbg_rawpointcolliderprojection_free: Fc, rawpointcolliderprojection_colliderHandle: zc, rawpointcolliderprojection_point: Tc, rawpointcolliderprojection_isInside: Mc, rawpointcolliderprojection_featureType: Dc, rawpointcolliderprojection_featureId: Hc, __wbg_rawrayintersection_free: kc, __wbg_rawraycolliderhit_free: Lc, __wbg_rawshape_free: Nc, rawshape_cuboid: Wc, rawshape_roundCuboid: Gc, rawshape_ball: Oc, rawshape_halfspace: Bc, rawshape_capsule: qc, rawshape_cylinder: Vc, rawshape_roundCylinder: Uc, rawshape_cone: Xc, rawshape_roundCone: Jc, rawshape_voxels: Kc, rawshape_voxelsFromPoints: Yc, rawshape_polyline: Zc, rawshape_trimesh: $c, rawshape_heightfield: Qc, rawshape_segment: tw, rawshape_triangle: ew, rawshape_roundTriangle: rw, rawshape_convexHull: iw, rawshape_roundConvexHull: nw, rawshape_convexMesh: sw, rawshape_roundConvexMesh: aw, rawshape_castShape: ow, rawshape_intersectsShape: _w, rawshape_contactShape: lw, rawshape_containsPoint: cw, rawshape_projectPoint: ww, rawshape_intersectsRay: hw, rawshape_castRay: dw, rawshape_castRayAndGetNormal: pw, __wbg_rawshapecasthit_free: uw, rawshapecasthit_witness1: gw, rawshapecasthit_normal1: bw, rawshapecasthit_normal2: fw, __wbg_rawcollidershapecasthit_free: mw, rawcollidershapecasthit_time_of_impact: yw, rawcollidershapecasthit_witness1: Sw, rawcollidershapecasthit_witness2: Rw, rawrotation_new: vw, rawrotation_identity: Cw, rawrotation_x: Iw, rawrotation_w: xw, rawvector_zero: Ew, rawvector_new: Aw, rawvector_set_x: Pw, rawvector_set_z: jw, rawvector_xyz: Fw, rawvector_yxz: zw, rawvector_zxy: Tw, rawvector_xzy: Mw, rawvector_yzx: Dw, rawvector_zyx: Hw, rawsdpmatrix3_elements: kw, __wbg_rawdebugrenderpipeline_free: Lw, rawdebugrenderpipeline_new: Nw, rawdebugrenderpipeline_vertices: Ww, rawdebugrenderpipeline_colors: Gw, rawdebugrenderpipeline_render: Ow, __wbg_raweventqueue_free: Bw, __wbg_rawcontactforceevent_free: qw, rawcontactforceevent_collider2: Vw, rawcontactforceevent_total_force: Uw, rawcontactforceevent_total_force_magnitude: Xw, rawcontactforceevent_max_force_direction: Jw, rawcontactforceevent_max_force_magnitude: Kw, raweventqueue_new: Yw, raweventqueue_drainCollisionEvents: Zw, raweventqueue_drainContactForceEvents: $w, raweventqueue_clear: Qw, __wbg_rawphysicspipeline_free: th, rawphysicspipeline_new: eh, rawphysicspipeline_step: rh, rawphysicspipeline_stepWithEvents: ih, rawquerypipeline_new: nh, rawquerypipeline_update: sh, rawquerypipeline_castRay: ah, rawquerypipeline_castRayAndGetNormal: oh, rawquerypipeline_intersectionsWithRay: _h, rawquerypipeline_intersectionWithShape: lh, rawquerypipeline_projectPoint: ch, rawquerypipeline_projectPointAndGetFeature: wh, rawquerypipeline_intersectionsWithPoint: hh, rawquerypipeline_castShape: dh, rawquerypipeline_intersectionsWithShape: ph, rawquerypipeline_collidersWithAabbIntersectingAabb: uh, __wbg_rawdeserializedworld_free: gh, rawdeserializedworld_takeGravity: bh, rawdeserializedworld_takeIntegrationParameters: fh, rawdeserializedworld_takeIslandManager: mh, rawdeserializedworld_takeBroadPhase: yh, rawdeserializedworld_takeNarrowPhase: Sh, rawdeserializedworld_takeBodies: Rh, rawdeserializedworld_takeColliders: vh, rawdeserializedworld_takeImpulseJoints: Ch, rawdeserializedworld_takeMultibodyJoints: Ih, __wbg_rawserializationpipeline_free: xh, rawserializationpipeline_new: Eh, rawserializationpipeline_serializeAll: Ah, rawserializationpipeline_deserializeAll: Ph, rawcolliderset_isHandleValid: jh, rawkinematiccharactercontroller_offset: Fh, rawintegrationparameters_normalizedAllowedLinearError: zh, rawintegrationparameters_numAdditionalFrictionIterations: Th, rawintegrationparameters_numInternalPgsIterations: Mh, rawrigidbodyset_len: Dh, rawshapecontact_distance: Hh, rawrayintersection_featureType: kh, rawraycolliderintersection_colliderHandle: Lh, rawrayintersection_time_of_impact: Nh, rawraycolliderintersection_featureType: Wh, rawraycolliderhit_colliderHandle: Gh, rawraycolliderintersection_time_of_impact: Oh, rawcollidershapecasthit_colliderHandle: Bh, rawraycolliderhit_timeOfImpact: qh, rawshapecasthit_time_of_impact: Vh, rawrotation_y: Uh, rawrotation_z: Xh, rawvector_x: Jh, rawvector_y: Kh, rawvector_z: Yh, rawcontactforceevent_collider1: Zh, rawintegrationparameters_normalizedPredictionDistance: $h, reserve_memory: Qh, __wbg_rawquerypipeline_free: td, rawrayintersection_featureId: ed, rawraycolliderintersection_featureId: rd, rawkinematiccharactercontroller_up: id, rawshapecontact_normal2: nd, rawshapecontact_point1: sd, rawshapecontact_point2: ad, rawrayintersection_normal: od, rawraycolliderintersection_normal: _d, rawshapecontact_normal1: ld, rawcollidershapecasthit_normal1: cd, rawcollidershapecasthit_normal2: wd, rawshapecasthit_witness2: hd, rawintegrationparameters_set_numAdditionalFrictionIterations: dd, rawintegrationparameters_set_numInternalPgsIterations: pd, rawvector_set_y: ud, __wbg_rawraycolliderintersection_free: gd, __wbg_rawcontactpair_free: bd, __wbg_rawsdpmatrix3_free: fd, __wbg_rawvector_free: md, __wbg_rawrotation_free: yd, __wbindgen_export_0: Sd, __wbindgen_add_to_stack_pointer: Rd, __wbindgen_export_1: vd, __wbindgen_export_2: Cd } = Hi, Id = Object.freeze(Object.defineProperty({
        __proto__: null,
        __wbg_rawbroadphase_free: R_,
        __wbg_rawccdsolver_free: Fs,
        __wbg_rawcharactercollision_free: dn,
        __wbg_rawcolliderset_free: Bl,
        __wbg_rawcollidershapecasthit_free: mw,
        __wbg_rawcontactforceevent_free: qw,
        __wbg_rawcontactmanifold_free: ic,
        __wbg_rawcontactpair_free: bd,
        __wbg_rawdebugrenderpipeline_free: Lw,
        __wbg_rawdeserializedworld_free: gh,
        __wbg_rawdynamicraycastvehiclecontroller_free: Mn,
        __wbg_raweventqueue_free: Bw,
        __wbg_rawgenericjoint_free: Aa,
        __wbg_rawimpulsejointset_free: $s,
        __wbg_rawintegrationparameters_free: aa,
        __wbg_rawislandmanager_free: Ia,
        __wbg_rawkinematiccharactercontroller_free: Ni,
        __wbg_rawmultibodyjointset_free: Ua,
        __wbg_rawnarrowphase_free: Zl,
        __wbg_rawphysicspipeline_free: th,
        __wbg_rawpidcontroller_free: vn,
        __wbg_rawpointcolliderprojection_free: Fc,
        __wbg_rawpointprojection_free: Ac,
        __wbg_rawquerypipeline_free: td,
        __wbg_rawraycolliderhit_free: Lc,
        __wbg_rawraycolliderintersection_free: gd,
        __wbg_rawrayintersection_free: kc,
        __wbg_rawrigidbodyset_free: u_,
        __wbg_rawrotation_free: yd,
        __wbg_rawsdpmatrix3_free: fd,
        __wbg_rawserializationpipeline_free: xh,
        __wbg_rawshape_free: Nc,
        __wbg_rawshapecasthit_free: uw,
        __wbg_rawshapecontact_free: Yl,
        __wbg_rawvector_free: md,
        __wbindgen_add_to_stack_pointer: Rd,
        __wbindgen_export_0: Sd,
        __wbindgen_export_1: vd,
        __wbindgen_export_2: Cd,
        memory: ki,
        rawbroadphase_new: v_,
        rawccdsolver_new: zs,
        rawcharactercollision_handle: un,
        rawcharactercollision_new: pn,
        rawcharactercollision_toi: fn,
        rawcharactercollision_translationDeltaApplied: gn,
        rawcharactercollision_translationDeltaRemaining: bn,
        rawcharactercollision_worldNormal1: Sn,
        rawcharactercollision_worldNormal2: Rn,
        rawcharactercollision_worldWitness1: mn,
        rawcharactercollision_worldWitness2: yn,
        rawcolliderset_coActiveCollisionTypes: dl,
        rawcolliderset_coActiveEvents: pl,
        rawcolliderset_coActiveHooks: hl,
        rawcolliderset_coCastCollider: fl,
        rawcolliderset_coCastRay: Cl,
        rawcolliderset_coCastRayAndGetNormal: Il,
        rawcolliderset_coCastShape: bl,
        rawcolliderset_coCollisionGroups: cl,
        rawcolliderset_coCombineVoxelStates: V_,
        rawcolliderset_coContactCollider: Sl,
        rawcolliderset_coContactForceEventThreshold: ul,
        rawcolliderset_coContactShape: yl,
        rawcolliderset_coContactSkin: nl,
        rawcolliderset_coContainsPoint: gl,
        rawcolliderset_coDensity: ol,
        rawcolliderset_coFriction: sl,
        rawcolliderset_coFrictionCombineRule: Pl,
        rawcolliderset_coHalfExtents: T_,
        rawcolliderset_coHalfHeight: k_,
        rawcolliderset_coHalfspaceNormal: z_,
        rawcolliderset_coHeightFieldFlags: K_,
        rawcolliderset_coHeightfieldHeights: Y_,
        rawcolliderset_coHeightfieldNCols: Q_,
        rawcolliderset_coHeightfieldNRows: $_,
        rawcolliderset_coHeightfieldScale: Z_,
        rawcolliderset_coIndices: X_,
        rawcolliderset_coIntersectsRay: vl,
        rawcolliderset_coIntersectsShape: ml,
        rawcolliderset_coIsEnabled: rl,
        rawcolliderset_coIsSensor: j_,
        rawcolliderset_coMass: _l,
        rawcolliderset_coParent: tl,
        rawcolliderset_coProjectPoint: Rl,
        rawcolliderset_coPropagateVoxelChange: q_,
        rawcolliderset_coRadius: D_,
        rawcolliderset_coRestitution: al,
        rawcolliderset_coRestitutionCombineRule: Fl,
        rawcolliderset_coRotation: I_,
        rawcolliderset_coRoundRadius: N_,
        rawcolliderset_coSetActiveCollisionTypes: kl,
        rawcolliderset_coSetActiveEvents: Hl,
        rawcolliderset_coSetActiveHooks: Dl,
        rawcolliderset_coSetCollisionGroups: Tl,
        rawcolliderset_coSetContactForceEventThreshold: Nl,
        rawcolliderset_coSetContactSkin: il,
        rawcolliderset_coSetDensity: Wl,
        rawcolliderset_coSetEnabled: el,
        rawcolliderset_coSetFriction: Al,
        rawcolliderset_coSetFrictionCombineRule: jl,
        rawcolliderset_coSetHalfExtents: M_,
        rawcolliderset_coSetHalfHeight: L_,
        rawcolliderset_coSetMass: Gl,
        rawcolliderset_coSetMassProperties: Ol,
        rawcolliderset_coSetRadius: H_,
        rawcolliderset_coSetRestitution: El,
        rawcolliderset_coSetRestitutionCombineRule: zl,
        rawcolliderset_coSetRotation: A_,
        rawcolliderset_coSetRotationWrtParent: P_,
        rawcolliderset_coSetRoundRadius: W_,
        rawcolliderset_coSetSensor: xl,
        rawcolliderset_coSetShape: Ll,
        rawcolliderset_coSetSolverGroups: Ml,
        rawcolliderset_coSetTranslation: x_,
        rawcolliderset_coSetTranslationWrtParent: E_,
        rawcolliderset_coSetVoxel: B_,
        rawcolliderset_coShapeType: F_,
        rawcolliderset_coSolverGroups: wl,
        rawcolliderset_coTranslation: C_,
        rawcolliderset_coTriMeshFlags: J_,
        rawcolliderset_coVertices: U_,
        rawcolliderset_coVolume: ll,
        rawcolliderset_coVoxelData: G_,
        rawcolliderset_coVoxelSize: O_,
        rawcolliderset_contains: Ul,
        rawcolliderset_createCollider: Xl,
        rawcolliderset_forEachColliderHandle: Kl,
        rawcolliderset_isHandleValid: jh,
        rawcolliderset_len: Vl,
        rawcolliderset_new: ql,
        rawcolliderset_remove: Jl,
        rawcollidershapecasthit_colliderHandle: Bh,
        rawcollidershapecasthit_normal1: cd,
        rawcollidershapecasthit_normal2: wd,
        rawcollidershapecasthit_time_of_impact: yw,
        rawcollidershapecasthit_witness1: Sw,
        rawcollidershapecasthit_witness2: Rw,
        rawcontactforceevent_collider1: Zh,
        rawcontactforceevent_collider2: Vw,
        rawcontactforceevent_max_force_direction: Jw,
        rawcontactforceevent_max_force_magnitude: Kw,
        rawcontactforceevent_total_force: Uw,
        rawcontactforceevent_total_force_magnitude: Xw,
        rawcontactmanifold_contact_dist: gc,
        rawcontactmanifold_contact_fid1: bc,
        rawcontactmanifold_contact_fid2: fc,
        rawcontactmanifold_contact_impulse: mc,
        rawcontactmanifold_contact_local_p1: pc,
        rawcontactmanifold_contact_local_p2: uc,
        rawcontactmanifold_contact_tangent_impulse_x: yc,
        rawcontactmanifold_contact_tangent_impulse_y: Sc,
        rawcontactmanifold_local_n1: lc,
        rawcontactmanifold_local_n2: cc,
        rawcontactmanifold_normal: _c,
        rawcontactmanifold_num_contacts: dc,
        rawcontactmanifold_num_solver_contacts: Rc,
        rawcontactmanifold_solver_contact_dist: Cc,
        rawcontactmanifold_solver_contact_friction: Ic,
        rawcontactmanifold_solver_contact_point: vc,
        rawcontactmanifold_solver_contact_restitution: xc,
        rawcontactmanifold_solver_contact_tangent_velocity: Ec,
        rawcontactmanifold_subshape1: wc,
        rawcontactmanifold_subshape2: hc,
        rawcontactpair_collider1: nc,
        rawcontactpair_collider2: sc,
        rawcontactpair_contactManifold: oc,
        rawcontactpair_numContactManifolds: ac,
        rawdebugrenderpipeline_colors: Gw,
        rawdebugrenderpipeline_new: Nw,
        rawdebugrenderpipeline_render: Ow,
        rawdebugrenderpipeline_vertices: Ww,
        rawdeserializedworld_takeBodies: Rh,
        rawdeserializedworld_takeBroadPhase: yh,
        rawdeserializedworld_takeColliders: vh,
        rawdeserializedworld_takeGravity: bh,
        rawdeserializedworld_takeImpulseJoints: Ch,
        rawdeserializedworld_takeIntegrationParameters: fh,
        rawdeserializedworld_takeIslandManager: mh,
        rawdeserializedworld_takeMultibodyJoints: Ih,
        rawdeserializedworld_takeNarrowPhase: Sh,
        rawdynamicraycastvehiclecontroller_add_wheel: On,
        rawdynamicraycastvehiclecontroller_chassis: kn,
        rawdynamicraycastvehiclecontroller_current_vehicle_speed: Hn,
        rawdynamicraycastvehiclecontroller_index_forward_axis: Wn,
        rawdynamicraycastvehiclecontroller_index_up_axis: Ln,
        rawdynamicraycastvehiclecontroller_new: Dn,
        rawdynamicraycastvehiclecontroller_num_wheels: Bn,
        rawdynamicraycastvehiclecontroller_set_index_forward_axis: Gn,
        rawdynamicraycastvehiclecontroller_set_index_up_axis: Nn,
        rawdynamicraycastvehiclecontroller_set_wheel_axle_cs: gs,
        rawdynamicraycastvehiclecontroller_set_wheel_brake: _s,
        rawdynamicraycastvehiclecontroller_set_wheel_chassis_connection_point_cs: Un,
        rawdynamicraycastvehiclecontroller_set_wheel_direction_cs: ps,
        rawdynamicraycastvehiclecontroller_set_wheel_engine_force: hs,
        rawdynamicraycastvehiclecontroller_set_wheel_friction_slip: fs,
        rawdynamicraycastvehiclecontroller_set_wheel_max_suspension_force: as,
        rawdynamicraycastvehiclecontroller_set_wheel_max_suspension_travel: Yn,
        rawdynamicraycastvehiclecontroller_set_wheel_radius: $n,
        rawdynamicraycastvehiclecontroller_set_wheel_side_friction_stiffness: ys,
        rawdynamicraycastvehiclecontroller_set_wheel_steering: cs,
        rawdynamicraycastvehiclecontroller_set_wheel_suspension_compression: rs,
        rawdynamicraycastvehiclecontroller_set_wheel_suspension_relaxation: ns,
        rawdynamicraycastvehiclecontroller_set_wheel_suspension_rest_length: Jn,
        rawdynamicraycastvehiclecontroller_set_wheel_suspension_stiffness: ts,
        rawdynamicraycastvehiclecontroller_update_vehicle: qn,
        rawdynamicraycastvehiclecontroller_wheel_axle_cs: us,
        rawdynamicraycastvehiclecontroller_wheel_brake: os,
        rawdynamicraycastvehiclecontroller_wheel_chassis_connection_point_cs: Vn,
        rawdynamicraycastvehiclecontroller_wheel_contact_normal_ws: Is,
        rawdynamicraycastvehiclecontroller_wheel_contact_point_ws: xs,
        rawdynamicraycastvehiclecontroller_wheel_direction_cs: ds,
        rawdynamicraycastvehiclecontroller_wheel_engine_force: ws,
        rawdynamicraycastvehiclecontroller_wheel_forward_impulse: Rs,
        rawdynamicraycastvehiclecontroller_wheel_friction_slip: bs,
        rawdynamicraycastvehiclecontroller_wheel_ground_object: js,
        rawdynamicraycastvehiclecontroller_wheel_hard_point_ws: As,
        rawdynamicraycastvehiclecontroller_wheel_is_in_contact: Ps,
        rawdynamicraycastvehiclecontroller_wheel_max_suspension_force: ss,
        rawdynamicraycastvehiclecontroller_wheel_max_suspension_travel: Kn,
        rawdynamicraycastvehiclecontroller_wheel_radius: Zn,
        rawdynamicraycastvehiclecontroller_wheel_rotation: Ss,
        rawdynamicraycastvehiclecontroller_wheel_side_friction_stiffness: ms,
        rawdynamicraycastvehiclecontroller_wheel_side_impulse: vs,
        rawdynamicraycastvehiclecontroller_wheel_steering: ls,
        rawdynamicraycastvehiclecontroller_wheel_suspension_compression: es,
        rawdynamicraycastvehiclecontroller_wheel_suspension_force: Cs,
        rawdynamicraycastvehiclecontroller_wheel_suspension_length: Es,
        rawdynamicraycastvehiclecontroller_wheel_suspension_relaxation: is,
        rawdynamicraycastvehiclecontroller_wheel_suspension_rest_length: Xn,
        rawdynamicraycastvehiclecontroller_wheel_suspension_stiffness: Qn,
        raweventqueue_clear: Qw,
        raweventqueue_drainCollisionEvents: Zw,
        raweventqueue_drainContactForceEvents: $w,
        raweventqueue_new: Yw,
        rawgenericjoint_fixed: Ma,
        rawgenericjoint_generic: Pa,
        rawgenericjoint_prismatic: Ta,
        rawgenericjoint_revolute: Da,
        rawgenericjoint_rope: Fa,
        rawgenericjoint_spherical: za,
        rawgenericjoint_spring: ja,
        rawimpulsejointset_contains: ia,
        rawimpulsejointset_createJoint: ta,
        rawimpulsejointset_forEachJointAttachedToRigidBody: sa,
        rawimpulsejointset_forEachJointHandle: na,
        rawimpulsejointset_jointAnchor1: Ls,
        rawimpulsejointset_jointAnchor2: Ns,
        rawimpulsejointset_jointBodyHandle1: Ms,
        rawimpulsejointset_jointBodyHandle2: Ds,
        rawimpulsejointset_jointConfigureMotor: Zs,
        rawimpulsejointset_jointConfigureMotorModel: Js,
        rawimpulsejointset_jointConfigureMotorPosition: Ys,
        rawimpulsejointset_jointConfigureMotorVelocity: Ks,
        rawimpulsejointset_jointContactsEnabled: Os,
        rawimpulsejointset_jointFrameX1: Hs,
        rawimpulsejointset_jointFrameX2: ks,
        rawimpulsejointset_jointLimitsEnabled: qs,
        rawimpulsejointset_jointLimitsMax: Us,
        rawimpulsejointset_jointLimitsMin: Vs,
        rawimpulsejointset_jointSetAnchor1: Ws,
        rawimpulsejointset_jointSetAnchor2: Gs,
        rawimpulsejointset_jointSetContactsEnabled: Bs,
        rawimpulsejointset_jointSetLimits: Xs,
        rawimpulsejointset_jointType: Ts,
        rawimpulsejointset_len: ra,
        rawimpulsejointset_new: Qs,
        rawimpulsejointset_remove: ea,
        rawintegrationparameters_contact_erp: la,
        rawintegrationparameters_dt: _a,
        rawintegrationparameters_lengthUnit: da,
        rawintegrationparameters_maxCcdSubsteps: ha,
        rawintegrationparameters_minIslandSize: wa,
        rawintegrationparameters_new: oa,
        rawintegrationparameters_normalizedAllowedLinearError: zh,
        rawintegrationparameters_normalizedPredictionDistance: $h,
        rawintegrationparameters_numAdditionalFrictionIterations: Th,
        rawintegrationparameters_numInternalPgsIterations: Mh,
        rawintegrationparameters_numSolverIterations: ca,
        rawintegrationparameters_set_contact_natural_frequency: ua,
        rawintegrationparameters_set_dt: pa,
        rawintegrationparameters_set_lengthUnit: Sa,
        rawintegrationparameters_set_maxCcdSubsteps: ya,
        rawintegrationparameters_set_minIslandSize: ma,
        rawintegrationparameters_set_normalizedAllowedLinearError: ga,
        rawintegrationparameters_set_normalizedPredictionDistance: ba,
        rawintegrationparameters_set_numAdditionalFrictionIterations: dd,
        rawintegrationparameters_set_numInternalPgsIterations: pd,
        rawintegrationparameters_set_numSolverIterations: fa,
        rawintegrationparameters_switchToSmallStepsPgsSolver: va,
        rawintegrationparameters_switchToSmallStepsPgsSolverWithoutWarmstart: Ca,
        rawintegrationparameters_switchToStandardPgsSolver: Ra,
        rawislandmanager_forEachActiveRigidBodyHandle: Ea,
        rawislandmanager_new: xa,
        rawkinematiccharactercontroller_autostepEnabled: Yi,
        rawkinematiccharactercontroller_autostepIncludesDynamicBodies: Ki,
        rawkinematiccharactercontroller_autostepMaxHeight: Xi,
        rawkinematiccharactercontroller_autostepMinWidth: Ji,
        rawkinematiccharactercontroller_computeColliderMovement: _n,
        rawkinematiccharactercontroller_computedCollision: hn,
        rawkinematiccharactercontroller_computedGrounded: cn,
        rawkinematiccharactercontroller_computedMovement: ln,
        rawkinematiccharactercontroller_disableAutostep: $i,
        rawkinematiccharactercontroller_disableSnapToGround: an,
        rawkinematiccharactercontroller_enableAutostep: Zi,
        rawkinematiccharactercontroller_enableSnapToGround: sn,
        rawkinematiccharactercontroller_maxSlopeClimbAngle: Qi,
        rawkinematiccharactercontroller_minSlopeSlideAngle: en,
        rawkinematiccharactercontroller_new: Wi,
        rawkinematiccharactercontroller_normalNudgeFactor: Oi,
        rawkinematiccharactercontroller_numComputedCollisions: wn,
        rawkinematiccharactercontroller_offset: Fh,
        rawkinematiccharactercontroller_setMaxSlopeClimbAngle: tn,
        rawkinematiccharactercontroller_setMinSlopeSlideAngle: rn,
        rawkinematiccharactercontroller_setNormalNudgeFactor: Bi,
        rawkinematiccharactercontroller_setOffset: qi,
        rawkinematiccharactercontroller_setSlideEnabled: Ui,
        rawkinematiccharactercontroller_setUp: Gi,
        rawkinematiccharactercontroller_slideEnabled: Vi,
        rawkinematiccharactercontroller_snapToGroundDistance: nn,
        rawkinematiccharactercontroller_snapToGroundEnabled: on,
        rawkinematiccharactercontroller_up: id,
        rawmultibodyjointset_contains: Ya,
        rawmultibodyjointset_createJoint: Ja,
        rawmultibodyjointset_forEachJointAttachedToRigidBody: $a,
        rawmultibodyjointset_forEachJointHandle: Za,
        rawmultibodyjointset_jointAnchor1: Na,
        rawmultibodyjointset_jointAnchor2: Wa,
        rawmultibodyjointset_jointContactsEnabled: Ga,
        rawmultibodyjointset_jointFrameX1: ka,
        rawmultibodyjointset_jointFrameX2: La,
        rawmultibodyjointset_jointLimitsEnabled: Ba,
        rawmultibodyjointset_jointLimitsMax: Va,
        rawmultibodyjointset_jointLimitsMin: qa,
        rawmultibodyjointset_jointSetContactsEnabled: Oa,
        rawmultibodyjointset_jointType: Ha,
        rawmultibodyjointset_new: Xa,
        rawmultibodyjointset_remove: Ka,
        rawnarrowphase_contact_pair: tc,
        rawnarrowphase_contact_pairs_with: Ql,
        rawnarrowphase_intersection_pair: rc,
        rawnarrowphase_intersection_pairs_with: ec,
        rawnarrowphase_new: $l,
        rawphysicspipeline_new: eh,
        rawphysicspipeline_step: rh,
        rawphysicspipeline_stepWithEvents: ih,
        rawpidcontroller_angular_correction: Tn,
        rawpidcontroller_apply_angular_correction: Fn,
        rawpidcontroller_apply_linear_correction: jn,
        rawpidcontroller_linear_correction: zn,
        rawpidcontroller_new: Cn,
        rawpidcontroller_reset_integrals: Pn,
        rawpidcontroller_set_axes_mask: An,
        rawpidcontroller_set_kd: En,
        rawpidcontroller_set_ki: xn,
        rawpidcontroller_set_kp: In,
        rawpointcolliderprojection_colliderHandle: zc,
        rawpointcolliderprojection_featureId: Hc,
        rawpointcolliderprojection_featureType: Dc,
        rawpointcolliderprojection_isInside: Mc,
        rawpointcolliderprojection_point: Tc,
        rawpointprojection_isInside: jc,
        rawpointprojection_point: Pc,
        rawquerypipeline_castRay: ah,
        rawquerypipeline_castRayAndGetNormal: oh,
        rawquerypipeline_castShape: dh,
        rawquerypipeline_collidersWithAabbIntersectingAabb: uh,
        rawquerypipeline_intersectionWithShape: lh,
        rawquerypipeline_intersectionsWithPoint: hh,
        rawquerypipeline_intersectionsWithRay: _h,
        rawquerypipeline_intersectionsWithShape: ph,
        rawquerypipeline_new: nh,
        rawquerypipeline_projectPoint: ch,
        rawquerypipeline_projectPointAndGetFeature: wh,
        rawquerypipeline_update: sh,
        rawraycolliderhit_colliderHandle: Gh,
        rawraycolliderhit_timeOfImpact: qh,
        rawraycolliderintersection_colliderHandle: Lh,
        rawraycolliderintersection_featureId: rd,
        rawraycolliderintersection_featureType: Wh,
        rawraycolliderintersection_normal: _d,
        rawraycolliderintersection_time_of_impact: Oh,
        rawrayintersection_featureId: ed,
        rawrayintersection_featureType: kh,
        rawrayintersection_normal: od,
        rawrayintersection_time_of_impact: Nh,
        rawrigidbodyset_contains: m_,
        rawrigidbodyset_createRigidBody: b_,
        rawrigidbodyset_forEachRigidBodyHandle: y_,
        rawrigidbodyset_len: Dh,
        rawrigidbodyset_new: g_,
        rawrigidbodyset_propagateModifiedBodyPositionsToColliders: S_,
        rawrigidbodyset_rbAddForce: i_,
        rawrigidbodyset_rbAddForceAtPoint: o_,
        rawrigidbodyset_rbAddTorque: s_,
        rawrigidbodyset_rbAdditionalSolverIterations: l_,
        rawrigidbodyset_rbAngularDamping: Jo,
        rawrigidbodyset_rbAngvel: bo,
        rawrigidbodyset_rbApplyImpulse: n_,
        rawrigidbodyset_rbApplyImpulseAtPoint: __,
        rawrigidbodyset_rbApplyTorqueImpulse: a_,
        rawrigidbodyset_rbBodyType: Oo,
        rawrigidbodyset_rbCollider: Go,
        rawrigidbodyset_rbDominanceGroup: vo,
        rawrigidbodyset_rbEffectiveAngularInertia: Ho,
        rawrigidbodyset_rbEffectiveInvMass: Po,
        rawrigidbodyset_rbEffectiveWorldInvInertiaSqrt: Do,
        rawrigidbodyset_rbEnableCcd: Io,
        rawrigidbodyset_rbGravityScale: Qo,
        rawrigidbodyset_rbInvMass: Ao,
        rawrigidbodyset_rbInvPrincipalInertiaSqrt: zo,
        rawrigidbodyset_rbIsCcdEnabled: Lo,
        rawrigidbodyset_rbIsDynamic: Uo,
        rawrigidbodyset_rbIsEnabled: $o,
        rawrigidbodyset_rbIsFixed: qo,
        rawrigidbodyset_rbIsKinematic: Vo,
        rawrigidbodyset_rbIsMoving: io,
        rawrigidbodyset_rbIsSleeping: ro,
        rawrigidbodyset_rbLinearDamping: Xo,
        rawrigidbodyset_rbLinvel: go,
        rawrigidbodyset_rbLocalCom: jo,
        rawrigidbodyset_rbLockRotations: So,
        rawrigidbodyset_rbLockTranslations: mo,
        rawrigidbodyset_rbMass: Eo,
        rawrigidbodyset_rbNextRotation: so,
        rawrigidbodyset_rbNextTranslation: no,
        rawrigidbodyset_rbNumColliders: Wo,
        rawrigidbodyset_rbPrincipalInertia: Mo,
        rawrigidbodyset_rbPrincipalInertiaLocalFrame: To,
        rawrigidbodyset_rbRecomputeMassPropertiesFromColliders: ho,
        rawrigidbodyset_rbResetForces: e_,
        rawrigidbodyset_rbResetTorques: r_,
        rawrigidbodyset_rbRotation: to,
        rawrigidbodyset_rbSetAdditionalMass: po,
        rawrigidbodyset_rbSetAdditionalMassProperties: uo,
        rawrigidbodyset_rbSetAdditionalSolverIterations: c_,
        rawrigidbodyset_rbSetAngularDamping: Yo,
        rawrigidbodyset_rbSetAngvel: lo,
        rawrigidbodyset_rbSetBodyType: Bo,
        rawrigidbodyset_rbSetDominanceGroup: Co,
        rawrigidbodyset_rbSetEnabled: Zo,
        rawrigidbodyset_rbSetEnabledRotations: Ro,
        rawrigidbodyset_rbSetEnabledTranslations: yo,
        rawrigidbodyset_rbSetGravityScale: t_,
        rawrigidbodyset_rbSetLinearDamping: Ko,
        rawrigidbodyset_rbSetLinvel: _o,
        rawrigidbodyset_rbSetNextKinematicRotation: wo,
        rawrigidbodyset_rbSetNextKinematicTranslation: co,
        rawrigidbodyset_rbSetRotation: oo,
        rawrigidbodyset_rbSetSoftCcdPrediction: xo,
        rawrigidbodyset_rbSetTranslation: ao,
        rawrigidbodyset_rbSetUserData: h_,
        rawrigidbodyset_rbSleep: eo,
        rawrigidbodyset_rbSoftCcdPrediction: No,
        rawrigidbodyset_rbTranslation: Qa,
        rawrigidbodyset_rbUserData: w_,
        rawrigidbodyset_rbUserForce: d_,
        rawrigidbodyset_rbUserTorque: p_,
        rawrigidbodyset_rbVelocityAtPoint: fo,
        rawrigidbodyset_rbWakeUp: ko,
        rawrigidbodyset_rbWorldCom: Fo,
        rawrigidbodyset_remove: f_,
        rawrotation_identity: Cw,
        rawrotation_new: vw,
        rawrotation_w: xw,
        rawrotation_x: Iw,
        rawrotation_y: Uh,
        rawrotation_z: Xh,
        rawsdpmatrix3_elements: kw,
        rawserializationpipeline_deserializeAll: Ph,
        rawserializationpipeline_new: Eh,
        rawserializationpipeline_serializeAll: Ah,
        rawshape_ball: Oc,
        rawshape_capsule: qc,
        rawshape_castRay: dw,
        rawshape_castRayAndGetNormal: pw,
        rawshape_castShape: ow,
        rawshape_cone: Xc,
        rawshape_contactShape: lw,
        rawshape_containsPoint: cw,
        rawshape_convexHull: iw,
        rawshape_convexMesh: sw,
        rawshape_cuboid: Wc,
        rawshape_cylinder: Vc,
        rawshape_halfspace: Bc,
        rawshape_heightfield: Qc,
        rawshape_intersectsRay: hw,
        rawshape_intersectsShape: _w,
        rawshape_polyline: Zc,
        rawshape_projectPoint: ww,
        rawshape_roundCone: Jc,
        rawshape_roundConvexHull: nw,
        rawshape_roundConvexMesh: aw,
        rawshape_roundCuboid: Gc,
        rawshape_roundCylinder: Uc,
        rawshape_roundTriangle: rw,
        rawshape_segment: tw,
        rawshape_triangle: ew,
        rawshape_trimesh: $c,
        rawshape_voxels: Kc,
        rawshape_voxelsFromPoints: Yc,
        rawshapecasthit_normal1: bw,
        rawshapecasthit_normal2: fw,
        rawshapecasthit_time_of_impact: Vh,
        rawshapecasthit_witness1: gw,
        rawshapecasthit_witness2: hd,
        rawshapecontact_distance: Hh,
        rawshapecontact_normal1: ld,
        rawshapecontact_normal2: nd,
        rawshapecontact_point1: sd,
        rawshapecontact_point2: ad,
        rawvector_new: Aw,
        rawvector_set_x: Pw,
        rawvector_set_y: ud,
        rawvector_set_z: jw,
        rawvector_x: Jh,
        rawvector_xyz: Fw,
        rawvector_xzy: Mw,
        rawvector_y: Kh,
        rawvector_yxz: zw,
        rawvector_yzx: Dw,
        rawvector_z: Yh,
        rawvector_zero: Ew,
        rawvector_zxy: Tw,
        rawvector_zyx: Hw,
        reserve_memory: Qh,
        version: Li
    }, Symbol.toStringTag, {
        value: "Module"
    }));
    Qr(Id);
    fr = class {
        constructor(t, e, r){
            this.x = t, this.y = e, this.z = r;
        }
    };
    c = class {
        static new(t, e, r) {
            return new fr(t, e, r);
        }
        static intoRaw(t) {
            return new l(t.x, t.y, t.z);
        }
        static zeros() {
            return c.new(0, 0, 0);
        }
        static fromRaw(t) {
            if (!t) return null;
            let e = c.new(t.x, t.y, t.z);
            return t.free(), e;
        }
        static copy(t, e) {
            t.x = e.x, t.y = e.y, t.z = e.z;
        }
    };
    ie = class {
        constructor(t, e, r, n){
            this.x = t, this.y = e, this.z = r, this.w = n;
        }
    };
    y = class {
        static identity() {
            return new ie(0, 0, 0, 1);
        }
        static fromRaw(t) {
            if (!t) return null;
            let e = new ie(t.x, t.y, t.z, t.w);
            return t.free(), e;
        }
        static intoRaw(t) {
            return new S(t.x, t.y, t.z, t.w);
        }
        static copy(t, e) {
            t.x = e.x, t.y = e.y, t.z = e.z, t.w = e.w;
        }
    };
    mr = class {
        get m11() {
            return this.elements[0];
        }
        get m12() {
            return this.elements[1];
        }
        get m21() {
            return this.m12;
        }
        get m13() {
            return this.elements[2];
        }
        get m31() {
            return this.m13;
        }
        get m22() {
            return this.elements[3];
        }
        get m23() {
            return this.elements[4];
        }
        get m32() {
            return this.m23;
        }
        get m33() {
            return this.elements[5];
        }
        constructor(t){
            this.elements = t;
        }
    };
    ne = class {
        static fromRaw(t) {
            const e = new mr(t.elements());
            return t.free(), e;
        }
    };
    (function(s) {
        s[s.Dynamic = 0] = "Dynamic", s[s.Fixed = 1] = "Fixed", s[s.KinematicPositionBased = 2] = "KinematicPositionBased", s[s.KinematicVelocityBased = 3] = "KinematicVelocityBased";
    })(O || (O = {}));
    se = class {
        constructor(t, e, r){
            this.rawSet = t, this.colliderSet = e, this.handle = r;
        }
        finalizeDeserialization(t) {
            this.colliderSet = t;
        }
        isValid() {
            return this.rawSet.contains(this.handle);
        }
        lockTranslations(t, e) {
            return this.rawSet.rbLockTranslations(this.handle, t, e);
        }
        lockRotations(t, e) {
            return this.rawSet.rbLockRotations(this.handle, t, e);
        }
        setEnabledTranslations(t, e, r, n) {
            return this.rawSet.rbSetEnabledTranslations(this.handle, t, e, r, n);
        }
        restrictTranslations(t, e, r, n) {
            this.setEnabledTranslations(t, e, r, n);
        }
        setEnabledRotations(t, e, r, n) {
            return this.rawSet.rbSetEnabledRotations(this.handle, t, e, r, n);
        }
        restrictRotations(t, e, r, n) {
            this.setEnabledRotations(t, e, r, n);
        }
        dominanceGroup() {
            return this.rawSet.rbDominanceGroup(this.handle);
        }
        setDominanceGroup(t) {
            this.rawSet.rbSetDominanceGroup(this.handle, t);
        }
        additionalSolverIterations() {
            return this.rawSet.rbAdditionalSolverIterations(this.handle);
        }
        setAdditionalSolverIterations(t) {
            this.rawSet.rbSetAdditionalSolverIterations(this.handle, t);
        }
        enableCcd(t) {
            this.rawSet.rbEnableCcd(this.handle, t);
        }
        setSoftCcdPrediction(t) {
            this.rawSet.rbSetSoftCcdPrediction(this.handle, t);
        }
        softCcdPrediction() {
            return this.rawSet.rbSoftCcdPrediction(this.handle);
        }
        translation() {
            let t = this.rawSet.rbTranslation(this.handle);
            return c.fromRaw(t);
        }
        rotation() {
            let t = this.rawSet.rbRotation(this.handle);
            return y.fromRaw(t);
        }
        nextTranslation() {
            let t = this.rawSet.rbNextTranslation(this.handle);
            return c.fromRaw(t);
        }
        nextRotation() {
            let t = this.rawSet.rbNextRotation(this.handle);
            return y.fromRaw(t);
        }
        setTranslation(t, e) {
            this.rawSet.rbSetTranslation(this.handle, t.x, t.y, t.z, e);
        }
        setLinvel(t, e) {
            let r = c.intoRaw(t);
            this.rawSet.rbSetLinvel(this.handle, r, e), r.free();
        }
        gravityScale() {
            return this.rawSet.rbGravityScale(this.handle);
        }
        setGravityScale(t, e) {
            this.rawSet.rbSetGravityScale(this.handle, t, e);
        }
        setRotation(t, e) {
            this.rawSet.rbSetRotation(this.handle, t.x, t.y, t.z, t.w, e);
        }
        setAngvel(t, e) {
            let r = c.intoRaw(t);
            this.rawSet.rbSetAngvel(this.handle, r, e), r.free();
        }
        setNextKinematicTranslation(t) {
            this.rawSet.rbSetNextKinematicTranslation(this.handle, t.x, t.y, t.z);
        }
        setNextKinematicRotation(t) {
            this.rawSet.rbSetNextKinematicRotation(this.handle, t.x, t.y, t.z, t.w);
        }
        linvel() {
            return c.fromRaw(this.rawSet.rbLinvel(this.handle));
        }
        velocityAtPoint(t) {
            const e = c.intoRaw(t);
            let r = c.fromRaw(this.rawSet.rbVelocityAtPoint(this.handle, e));
            return e.free(), r;
        }
        angvel() {
            return c.fromRaw(this.rawSet.rbAngvel(this.handle));
        }
        mass() {
            return this.rawSet.rbMass(this.handle);
        }
        effectiveInvMass() {
            return c.fromRaw(this.rawSet.rbEffectiveInvMass(this.handle));
        }
        invMass() {
            return this.rawSet.rbInvMass(this.handle);
        }
        localCom() {
            return c.fromRaw(this.rawSet.rbLocalCom(this.handle));
        }
        worldCom() {
            return c.fromRaw(this.rawSet.rbWorldCom(this.handle));
        }
        invPrincipalInertiaSqrt() {
            return c.fromRaw(this.rawSet.rbInvPrincipalInertiaSqrt(this.handle));
        }
        principalInertia() {
            return c.fromRaw(this.rawSet.rbPrincipalInertia(this.handle));
        }
        principalInertiaLocalFrame() {
            return y.fromRaw(this.rawSet.rbPrincipalInertiaLocalFrame(this.handle));
        }
        effectiveWorldInvInertiaSqrt() {
            return ne.fromRaw(this.rawSet.rbEffectiveWorldInvInertiaSqrt(this.handle));
        }
        effectiveAngularInertia() {
            return ne.fromRaw(this.rawSet.rbEffectiveAngularInertia(this.handle));
        }
        sleep() {
            this.rawSet.rbSleep(this.handle);
        }
        wakeUp() {
            this.rawSet.rbWakeUp(this.handle);
        }
        isCcdEnabled() {
            return this.rawSet.rbIsCcdEnabled(this.handle);
        }
        numColliders() {
            return this.rawSet.rbNumColliders(this.handle);
        }
        collider(t) {
            return this.colliderSet.get(this.rawSet.rbCollider(this.handle, t));
        }
        setEnabled(t) {
            this.rawSet.rbSetEnabled(this.handle, t);
        }
        isEnabled() {
            return this.rawSet.rbIsEnabled(this.handle);
        }
        bodyType() {
            return this.rawSet.rbBodyType(this.handle);
        }
        setBodyType(t, e) {
            return this.rawSet.rbSetBodyType(this.handle, t, e);
        }
        isSleeping() {
            return this.rawSet.rbIsSleeping(this.handle);
        }
        isMoving() {
            return this.rawSet.rbIsMoving(this.handle);
        }
        isFixed() {
            return this.rawSet.rbIsFixed(this.handle);
        }
        isKinematic() {
            return this.rawSet.rbIsKinematic(this.handle);
        }
        isDynamic() {
            return this.rawSet.rbIsDynamic(this.handle);
        }
        linearDamping() {
            return this.rawSet.rbLinearDamping(this.handle);
        }
        angularDamping() {
            return this.rawSet.rbAngularDamping(this.handle);
        }
        setLinearDamping(t) {
            this.rawSet.rbSetLinearDamping(this.handle, t);
        }
        recomputeMassPropertiesFromColliders() {
            this.rawSet.rbRecomputeMassPropertiesFromColliders(this.handle, this.colliderSet.raw);
        }
        setAdditionalMass(t, e) {
            this.rawSet.rbSetAdditionalMass(this.handle, t, e);
        }
        setAdditionalMassProperties(t, e, r, n, a) {
            let o = c.intoRaw(e), w = c.intoRaw(r), h = y.intoRaw(n);
            this.rawSet.rbSetAdditionalMassProperties(this.handle, t, o, w, h, a), o.free(), w.free(), h.free();
        }
        setAngularDamping(t) {
            this.rawSet.rbSetAngularDamping(this.handle, t);
        }
        resetForces(t) {
            this.rawSet.rbResetForces(this.handle, t);
        }
        resetTorques(t) {
            this.rawSet.rbResetTorques(this.handle, t);
        }
        addForce(t, e) {
            const r = c.intoRaw(t);
            this.rawSet.rbAddForce(this.handle, r, e), r.free();
        }
        applyImpulse(t, e) {
            const r = c.intoRaw(t);
            this.rawSet.rbApplyImpulse(this.handle, r, e), r.free();
        }
        addTorque(t, e) {
            const r = c.intoRaw(t);
            this.rawSet.rbAddTorque(this.handle, r, e), r.free();
        }
        applyTorqueImpulse(t, e) {
            const r = c.intoRaw(t);
            this.rawSet.rbApplyTorqueImpulse(this.handle, r, e), r.free();
        }
        addForceAtPoint(t, e, r) {
            const n = c.intoRaw(t), a = c.intoRaw(e);
            this.rawSet.rbAddForceAtPoint(this.handle, n, a, r), n.free(), a.free();
        }
        applyImpulseAtPoint(t, e, r) {
            const n = c.intoRaw(t), a = c.intoRaw(e);
            this.rawSet.rbApplyImpulseAtPoint(this.handle, n, a, r), n.free(), a.free();
        }
        userForce() {
            return c.fromRaw(this.rawSet.rbUserForce(this.handle));
        }
        userTorque() {
            return c.fromRaw(this.rawSet.rbUserTorque(this.handle));
        }
    };
    V = class {
        constructor(t){
            this.enabled = !0, this.status = t, this.translation = c.zeros(), this.rotation = y.identity(), this.gravityScale = 1, this.linvel = c.zeros(), this.mass = 0, this.massOnly = !1, this.centerOfMass = c.zeros(), this.translationsEnabledX = !0, this.translationsEnabledY = !0, this.angvel = c.zeros(), this.principalAngularInertia = c.zeros(), this.angularInertiaLocalFrame = y.identity(), this.translationsEnabledZ = !0, this.rotationsEnabledX = !0, this.rotationsEnabledY = !0, this.rotationsEnabledZ = !0, this.linearDamping = 0, this.angularDamping = 0, this.canSleep = !0, this.sleeping = !1, this.ccdEnabled = !1, this.softCcdPrediction = 0, this.dominanceGroup = 0, this.additionalSolverIterations = 0;
        }
        static dynamic() {
            return new V(O.Dynamic);
        }
        static kinematicPositionBased() {
            return new V(O.KinematicPositionBased);
        }
        static kinematicVelocityBased() {
            return new V(O.KinematicVelocityBased);
        }
        static fixed() {
            return new V(O.Fixed);
        }
        static newDynamic() {
            return new V(O.Dynamic);
        }
        static newKinematicPositionBased() {
            return new V(O.KinematicPositionBased);
        }
        static newKinematicVelocityBased() {
            return new V(O.KinematicVelocityBased);
        }
        static newStatic() {
            return new V(O.Fixed);
        }
        setDominanceGroup(t) {
            return this.dominanceGroup = t, this;
        }
        setAdditionalSolverIterations(t) {
            return this.additionalSolverIterations = t, this;
        }
        setEnabled(t) {
            return this.enabled = t, this;
        }
        setTranslation(t, e, r) {
            if (typeof t != "number" || typeof e != "number" || typeof r != "number") throw TypeError("The translation components must be numbers.");
            return this.translation = {
                x: t,
                y: e,
                z: r
            }, this;
        }
        setRotation(t) {
            return y.copy(this.rotation, t), this;
        }
        setGravityScale(t) {
            return this.gravityScale = t, this;
        }
        setAdditionalMass(t) {
            return this.mass = t, this.massOnly = !0, this;
        }
        setLinvel(t, e, r) {
            if (typeof t != "number" || typeof e != "number" || typeof r != "number") throw TypeError("The linvel components must be numbers.");
            return this.linvel = {
                x: t,
                y: e,
                z: r
            }, this;
        }
        setAngvel(t) {
            return c.copy(this.angvel, t), this;
        }
        setAdditionalMassProperties(t, e, r, n) {
            return this.mass = t, c.copy(this.centerOfMass, e), c.copy(this.principalAngularInertia, r), y.copy(this.angularInertiaLocalFrame, n), this.massOnly = !1, this;
        }
        enabledTranslations(t, e, r) {
            return this.translationsEnabledX = t, this.translationsEnabledY = e, this.translationsEnabledZ = r, this;
        }
        restrictTranslations(t, e, r) {
            return this.enabledTranslations(t, e, r);
        }
        lockTranslations() {
            return this.enabledTranslations(!1, !1, !1);
        }
        enabledRotations(t, e, r) {
            return this.rotationsEnabledX = t, this.rotationsEnabledY = e, this.rotationsEnabledZ = r, this;
        }
        restrictRotations(t, e, r) {
            return this.enabledRotations(t, e, r);
        }
        lockRotations() {
            return this.restrictRotations(!1, !1, !1);
        }
        setLinearDamping(t) {
            return this.linearDamping = t, this;
        }
        setAngularDamping(t) {
            return this.angularDamping = t, this;
        }
        setCanSleep(t) {
            return this.canSleep = t, this;
        }
        setSleeping(t) {
            return this.sleeping = t, this;
        }
        setCcdEnabled(t) {
            return this.ccdEnabled = t, this;
        }
        setSoftCcdPrediction(t) {
            return this.softCcdPrediction = t, this;
        }
        setUserData(t) {
            return this.userData = t, this;
        }
    };
    class Dt {
        constructor(){
            this.fconv = new Float64Array(1), this.uconv = new Uint32Array(this.fconv.buffer), this.data = new Array, this.size = 0;
        }
        set(t, e) {
            let r = this.index(t);
            for(; this.data.length <= r;)this.data.push(null);
            this.data[r] == null && (this.size += 1), this.data[r] = e;
        }
        len() {
            return this.size;
        }
        delete(t) {
            let e = this.index(t);
            e < this.data.length && (this.data[e] != null && (this.size -= 1), this.data[e] = null);
        }
        clear() {
            this.data = new Array;
        }
        get(t) {
            let e = this.index(t);
            return e < this.data.length ? this.data[e] : null;
        }
        forEach(t) {
            for (const e of this.data)e != null && t(e);
        }
        getAll() {
            return this.data.filter((t)=>t != null);
        }
        index(t) {
            return this.fconv[0] = t, this.uconv[0];
        }
    }
    yr = class {
        free() {
            this.raw && this.raw.free(), this.raw = void 0, this.map && this.map.clear(), this.map = void 0;
        }
        constructor(t){
            this.raw = t || new E, this.map = new Dt, t && t.forEachRigidBodyHandle((e)=>{
                this.map.set(e, new se(t, null, e));
            });
        }
        finalizeDeserialization(t) {
            this.map.forEach((e)=>e.finalizeDeserialization(t));
        }
        createRigidBody(t, e) {
            let r = c.intoRaw(e.translation), n = y.intoRaw(e.rotation), a = c.intoRaw(e.linvel), o = c.intoRaw(e.centerOfMass), w = c.intoRaw(e.angvel), h = c.intoRaw(e.principalAngularInertia), d = y.intoRaw(e.angularInertiaLocalFrame), p = this.raw.createRigidBody(e.enabled, r, n, e.gravityScale, e.mass, e.massOnly, o, a, w, h, d, e.translationsEnabledX, e.translationsEnabledY, e.translationsEnabledZ, e.rotationsEnabledX, e.rotationsEnabledY, e.rotationsEnabledZ, e.linearDamping, e.angularDamping, e.status, e.canSleep, e.sleeping, e.softCcdPrediction, e.ccdEnabled, e.dominanceGroup, e.additionalSolverIterations);
            r.free(), n.free(), a.free(), o.free(), w.free(), h.free(), d.free();
            const u = new se(this.raw, t, p);
            return u.userData = e.userData, this.map.set(p, u), u;
        }
        remove(t, e, r, n, a) {
            for(let o = 0; o < this.raw.rbNumColliders(t); o += 1)r.unmap(this.raw.rbCollider(t, o));
            n.forEachJointHandleAttachedToRigidBody(t, (o)=>n.unmap(o)), a.forEachJointHandleAttachedToRigidBody(t, (o)=>a.unmap(o)), this.raw.remove(t, e.raw, r.raw, n.raw, a.raw), this.map.delete(t);
        }
        len() {
            return this.map.len();
        }
        contains(t) {
            return this.get(t) != null;
        }
        get(t) {
            return this.map.get(t);
        }
        forEach(t) {
            this.map.forEach(t);
        }
        forEachActiveRigidBody(t, e) {
            t.forEachActiveRigidBodyHandle((r)=>{
                e(this.get(r));
            });
        }
        getAll() {
            return this.map.getAll();
        }
    };
    Sr = class {
        constructor(t){
            this.raw = t || new rt;
        }
        free() {
            this.raw && this.raw.free(), this.raw = void 0;
        }
        get dt() {
            return this.raw.dt;
        }
        get contact_erp() {
            return this.raw.contact_erp;
        }
        get lengthUnit() {
            return this.raw.lengthUnit;
        }
        get normalizedAllowedLinearError() {
            return this.raw.normalizedAllowedLinearError;
        }
        get normalizedPredictionDistance() {
            return this.raw.normalizedPredictionDistance;
        }
        get numSolverIterations() {
            return this.raw.numSolverIterations;
        }
        get numAdditionalFrictionIterations() {
            return this.raw.numAdditionalFrictionIterations;
        }
        get numInternalPgsIterations() {
            return this.raw.numInternalPgsIterations;
        }
        get minIslandSize() {
            return this.raw.minIslandSize;
        }
        get maxCcdSubsteps() {
            return this.raw.maxCcdSubsteps;
        }
        set dt(t) {
            this.raw.dt = t;
        }
        set contact_natural_frequency(t) {
            this.raw.contact_natural_frequency = t;
        }
        set lengthUnit(t) {
            this.raw.lengthUnit = t;
        }
        set normalizedAllowedLinearError(t) {
            this.raw.normalizedAllowedLinearError = t;
        }
        set normalizedPredictionDistance(t) {
            this.raw.normalizedPredictionDistance = t;
        }
        set numSolverIterations(t) {
            this.raw.numSolverIterations = t;
        }
        set numAdditionalFrictionIterations(t) {
            this.raw.numAdditionalFrictionIterations = t;
        }
        set numInternalPgsIterations(t) {
            this.raw.numInternalPgsIterations = t;
        }
        set minIslandSize(t) {
            this.raw.minIslandSize = t;
        }
        set maxCcdSubsteps(t) {
            this.raw.maxCcdSubsteps = t;
        }
        switchToStandardPgsSolver() {
            this.raw.switchToStandardPgsSolver();
        }
        switchToSmallStepsPgsSolver() {
            this.raw.switchToSmallStepsPgsSolver();
        }
        switchToSmallStepsPgsSolverWithoutWarmstart() {
            this.raw.switchToSmallStepsPgsSolverWithoutWarmstart();
        }
    };
    (function(s) {
        s[s.Revolute = 0] = "Revolute", s[s.Fixed = 1] = "Fixed", s[s.Prismatic = 2] = "Prismatic", s[s.Rope = 3] = "Rope", s[s.Spring = 4] = "Spring", s[s.Spherical = 5] = "Spherical", s[s.Generic = 6] = "Generic";
    })(H || (H = {}));
    (function(s) {
        s[s.AccelerationBased = 0] = "AccelerationBased", s[s.ForceBased = 1] = "ForceBased";
    })(ae || (ae = {}));
    (function(s) {
        s[s.LinX = 1] = "LinX", s[s.LinY = 2] = "LinY", s[s.LinZ = 4] = "LinZ", s[s.AngX = 8] = "AngX", s[s.AngY = 16] = "AngY", s[s.AngZ = 32] = "AngZ";
    })(oe || (oe = {}));
    q = class {
        constructor(t, e, r){
            this.rawSet = t, this.bodySet = e, this.handle = r;
        }
        static newTyped(t, e, r) {
            switch(t.jointType(r)){
                case B.Revolute:
                    return new xr(t, e, r);
                case B.Prismatic:
                    return new Ir(t, e, r);
                case B.Fixed:
                    return new Rr(t, e, r);
                case B.Spring:
                    return new Cr(t, e, r);
                case B.Rope:
                    return new vr(t, e, r);
                case B.Spherical:
                    return new Ar(t, e, r);
                case B.Generic:
                    return new Er(t, e, r);
                default:
                    return new q(t, e, r);
            }
        }
        finalizeDeserialization(t) {
            this.bodySet = t;
        }
        isValid() {
            return this.rawSet.contains(this.handle);
        }
        body1() {
            return this.bodySet.get(this.rawSet.jointBodyHandle1(this.handle));
        }
        body2() {
            return this.bodySet.get(this.rawSet.jointBodyHandle2(this.handle));
        }
        type() {
            return this.rawSet.jointType(this.handle);
        }
        frameX1() {
            return y.fromRaw(this.rawSet.jointFrameX1(this.handle));
        }
        frameX2() {
            return y.fromRaw(this.rawSet.jointFrameX2(this.handle));
        }
        anchor1() {
            return c.fromRaw(this.rawSet.jointAnchor1(this.handle));
        }
        anchor2() {
            return c.fromRaw(this.rawSet.jointAnchor2(this.handle));
        }
        setAnchor1(t) {
            const e = c.intoRaw(t);
            this.rawSet.jointSetAnchor1(this.handle, e), e.free();
        }
        setAnchor2(t) {
            const e = c.intoRaw(t);
            this.rawSet.jointSetAnchor2(this.handle, e), e.free();
        }
        setContactsEnabled(t) {
            this.rawSet.jointSetContactsEnabled(this.handle, t);
        }
        contactsEnabled() {
            return this.rawSet.jointContactsEnabled(this.handle);
        }
    };
    Re = class extends q {
        limitsEnabled() {
            return this.rawSet.jointLimitsEnabled(this.handle, this.rawAxis());
        }
        limitsMin() {
            return this.rawSet.jointLimitsMin(this.handle, this.rawAxis());
        }
        limitsMax() {
            return this.rawSet.jointLimitsMax(this.handle, this.rawAxis());
        }
        setLimits(t, e) {
            this.rawSet.jointSetLimits(this.handle, this.rawAxis(), t, e);
        }
        configureMotorModel(t) {
            this.rawSet.jointConfigureMotorModel(this.handle, this.rawAxis(), t);
        }
        configureMotorVelocity(t, e) {
            this.rawSet.jointConfigureMotorVelocity(this.handle, this.rawAxis(), t, e);
        }
        configureMotorPosition(t, e, r) {
            this.rawSet.jointConfigureMotorPosition(this.handle, this.rawAxis(), t, e, r);
        }
        configureMotor(t, e, r, n) {
            this.rawSet.jointConfigureMotor(this.handle, this.rawAxis(), t, e, r, n);
        }
    };
    Rr = class extends q {
    };
    vr = class extends q {
    };
    Cr = class extends q {
    };
    Ir = class extends Re {
        rawAxis() {
            return Pt.LinX;
        }
    };
    xr = class extends Re {
        rawAxis() {
            return Pt.AngX;
        }
    };
    Er = class extends q {
    };
    Ar = class extends q {
    };
    U = class {
        constructor(){}
        static fixed(t, e, r, n) {
            let a = new U;
            return a.anchor1 = t, a.anchor2 = r, a.frame1 = e, a.frame2 = n, a.jointType = H.Fixed, a;
        }
        static spring(t, e, r, n, a) {
            let o = new U;
            return o.anchor1 = n, o.anchor2 = a, o.length = t, o.stiffness = e, o.damping = r, o.jointType = H.Spring, o;
        }
        static rope(t, e, r) {
            let n = new U;
            return n.anchor1 = e, n.anchor2 = r, n.length = t, n.jointType = H.Rope, n;
        }
        static generic(t, e, r, n) {
            let a = new U;
            return a.anchor1 = t, a.anchor2 = e, a.axis = r, a.axesMask = n, a.jointType = H.Generic, a;
        }
        static spherical(t, e) {
            let r = new U;
            return r.anchor1 = t, r.anchor2 = e, r.jointType = H.Spherical, r;
        }
        static prismatic(t, e, r) {
            let n = new U;
            return n.anchor1 = t, n.anchor2 = e, n.axis = r, n.jointType = H.Prismatic, n;
        }
        static revolute(t, e, r) {
            let n = new U;
            return n.anchor1 = t, n.anchor2 = e, n.axis = r, n.jointType = H.Revolute, n;
        }
        intoRaw() {
            let t = c.intoRaw(this.anchor1), e = c.intoRaw(this.anchor2), r, n, a = !1, o = 0, w = 0;
            switch(this.jointType){
                case H.Fixed:
                    let h = y.intoRaw(this.frame1), d = y.intoRaw(this.frame2);
                    n = D.fixed(t, h, e, d), h.free(), d.free();
                    break;
                case H.Spring:
                    n = D.spring(this.length, this.stiffness, this.damping, t, e);
                    break;
                case H.Rope:
                    n = D.rope(this.length, t, e);
                    break;
                case H.Prismatic:
                    r = c.intoRaw(this.axis), this.limitsEnabled && (a = !0, o = this.limits[0], w = this.limits[1]), n = D.prismatic(t, e, r, a, o, w), r.free();
                    break;
                case H.Generic:
                    r = c.intoRaw(this.axis);
                    let p = this.axesMask;
                    n = D.generic(t, e, r, p);
                    break;
                case H.Spherical:
                    n = D.spherical(t, e);
                    break;
                case H.Revolute:
                    r = c.intoRaw(this.axis), n = D.revolute(t, e, r), r.free();
                    break;
            }
            return t.free(), e.free(), n;
        }
    };
    Pr = class {
        free() {
            this.raw && this.raw.free(), this.raw = void 0, this.map && this.map.clear(), this.map = void 0;
        }
        constructor(t){
            this.raw = t || new X, this.map = new Dt, t && t.forEachJointHandle((e)=>{
                this.map.set(e, q.newTyped(t, null, e));
            });
        }
        finalizeDeserialization(t) {
            this.map.forEach((e)=>e.finalizeDeserialization(t));
        }
        createJoint(t, e, r, n, a) {
            const o = e.intoRaw(), w = this.raw.createJoint(o, r, n, a);
            o.free();
            let h = q.newTyped(this.raw, t, w);
            return this.map.set(w, h), h;
        }
        remove(t, e) {
            this.raw.remove(t, e), this.unmap(t);
        }
        forEachJointHandleAttachedToRigidBody(t, e) {
            this.raw.forEachJointAttachedToRigidBody(t, e);
        }
        unmap(t) {
            this.map.delete(t);
        }
        len() {
            return this.map.len();
        }
        contains(t) {
            return this.get(t) != null;
        }
        get(t) {
            return this.map.get(t);
        }
        forEach(t) {
            this.map.forEach(t);
        }
        getAll() {
            return this.map.getAll();
        }
    };
    $ = class {
        constructor(t, e){
            this.rawSet = t, this.handle = e;
        }
        static newTyped(t, e) {
            switch(t.jointType(e)){
                case B.Revolute:
                    return new zr(t, e);
                case B.Prismatic:
                    return new Fr(t, e);
                case B.Fixed:
                    return new jr(t, e);
                case B.Spherical:
                    return new Tr(t, e);
                default:
                    return new $(t, e);
            }
        }
        isValid() {
            return this.rawSet.contains(this.handle);
        }
        setContactsEnabled(t) {
            this.rawSet.jointSetContactsEnabled(this.handle, t);
        }
        contactsEnabled() {
            return this.rawSet.jointContactsEnabled(this.handle);
        }
    };
    ve = class extends $ {
    };
    jr = class extends $ {
    };
    Fr = class extends ve {
        rawAxis() {
            return Pt.LinX;
        }
    };
    zr = class extends ve {
        rawAxis() {
            return Pt.AngX;
        }
    };
    Tr = class extends $ {
    };
    Mr = class {
        free() {
            this.raw && this.raw.free(), this.raw = void 0, this.map && this.map.clear(), this.map = void 0;
        }
        constructor(t){
            this.raw = t || new K, this.map = new Dt, t && t.forEachJointHandle((e)=>{
                this.map.set(e, $.newTyped(this.raw, e));
            });
        }
        createJoint(t, e, r, n) {
            const a = t.intoRaw(), o = this.raw.createJoint(a, e, r, n);
            a.free();
            let w = $.newTyped(this.raw, o);
            return this.map.set(o, w), w;
        }
        remove(t, e) {
            this.raw.remove(t, e), this.map.delete(t);
        }
        unmap(t) {
            this.map.delete(t);
        }
        len() {
            return this.map.len();
        }
        contains(t) {
            return this.get(t) != null;
        }
        get(t) {
            return this.map.get(t);
        }
        forEach(t) {
            this.map.forEach(t);
        }
        forEachJointHandleAttachedToRigidBody(t, e) {
            this.raw.forEachJointAttachedToRigidBody(t, e);
        }
        getAll() {
            return this.map.getAll();
        }
    };
    (function(s) {
        s[s.Average = 0] = "Average", s[s.Min = 1] = "Min", s[s.Multiply = 2] = "Multiply", s[s.Max = 3] = "Max";
    })(wt || (wt = {}));
    Dr = class {
        free() {
            this.raw && this.raw.free(), this.raw = void 0;
        }
        constructor(t){
            this.raw = t || new re;
        }
    };
    Hr = class {
        free() {
            this.raw && this.raw.free(), this.raw = void 0;
        }
        constructor(t){
            this.raw = t || new J;
        }
        forEachActiveRigidBodyHandle(t) {
            this.raw.forEachActiveRigidBodyHandle(t);
        }
    };
    kr = class {
        free() {
            this.raw && this.raw.free(), this.raw = void 0;
        }
        constructor(t){
            this.raw = t || new et;
        }
    };
    Lr = class {
        free() {
            this.raw && this.raw.free(), this.raw = void 0;
        }
        constructor(t){
            this.raw = t || new Z, this.tempManifold = new Nr(null);
        }
        contactPairsWith(t, e) {
            this.raw.contact_pairs_with(t, e);
        }
        intersectionPairsWith(t, e) {
            this.raw.intersection_pairs_with(t, e);
        }
        contactPair(t, e, r) {
            const n = this.raw.contact_pair(t, e);
            if (n) {
                const a = n.collider1() != t;
                let o;
                for(o = 0; o < n.numContactManifolds(); ++o)this.tempManifold.raw = n.contactManifold(o), this.tempManifold.raw && r(this.tempManifold, a), this.tempManifold.free();
                n.free();
            }
        }
        intersectionPair(t, e) {
            return this.raw.intersection_pair(t, e);
        }
    };
    Nr = class {
        free() {
            this.raw && this.raw.free(), this.raw = void 0;
        }
        constructor(t){
            this.raw = t;
        }
        normal() {
            return c.fromRaw(this.raw.normal());
        }
        localNormal1() {
            return c.fromRaw(this.raw.local_n1());
        }
        localNormal2() {
            return c.fromRaw(this.raw.local_n2());
        }
        subshape1() {
            return this.raw.subshape1();
        }
        subshape2() {
            return this.raw.subshape2();
        }
        numContacts() {
            return this.raw.num_contacts();
        }
        localContactPoint1(t) {
            return c.fromRaw(this.raw.contact_local_p1(t));
        }
        localContactPoint2(t) {
            return c.fromRaw(this.raw.contact_local_p2(t));
        }
        contactDist(t) {
            return this.raw.contact_dist(t);
        }
        contactFid1(t) {
            return this.raw.contact_fid1(t);
        }
        contactFid2(t) {
            return this.raw.contact_fid2(t);
        }
        contactImpulse(t) {
            return this.raw.contact_impulse(t);
        }
        contactTangentImpulseX(t) {
            return this.raw.contact_tangent_impulse_x(t);
        }
        contactTangentImpulseY(t) {
            return this.raw.contact_tangent_impulse_y(t);
        }
        numSolverContacts() {
            return this.raw.num_solver_contacts();
        }
        solverContactPoint(t) {
            return c.fromRaw(this.raw.solver_contact_point(t));
        }
        solverContactDist(t) {
            return this.raw.solver_contact_dist(t);
        }
        solverContactFriction(t) {
            return this.raw.solver_contact_friction(t);
        }
        solverContactRestitution(t) {
            return this.raw.solver_contact_restitution(t);
        }
        solverContactTangentVelocity(t) {
            return c.fromRaw(this.raw.solver_contact_tangent_velocity(t));
        }
    };
    nt = class {
        constructor(t, e, r, n, a){
            this.distance = t, this.point1 = e, this.point2 = r, this.normal1 = n, this.normal2 = a;
        }
        static fromRaw(t) {
            if (!t) return null;
            const e = new nt(t.distance(), c.fromRaw(t.point1()), c.fromRaw(t.point2()), c.fromRaw(t.normal1()), c.fromRaw(t.normal2()));
            return t.free(), e;
        }
    };
    (function(s) {
        s[s.Vertex = 0] = "Vertex", s[s.Edge = 1] = "Edge", s[s.Face = 2] = "Face", s[s.Unknown = 3] = "Unknown";
    })(st || (st = {}));
    pt = class {
        constructor(t, e){
            this.point = t, this.isInside = e;
        }
        static fromRaw(t) {
            if (!t) return null;
            const e = new pt(c.fromRaw(t.point()), t.isInside());
            return t.free(), e;
        }
    };
    ht = class {
        constructor(t, e, r, n, a){
            this.featureType = st.Unknown, this.featureId = void 0, this.collider = t, this.point = e, this.isInside = r, a !== void 0 && (this.featureId = a), n !== void 0 && (this.featureType = n);
        }
        static fromRaw(t, e) {
            if (!e) return null;
            const r = new ht(t.get(e.colliderHandle()), c.fromRaw(e.point()), e.isInside(), e.featureType(), e.featureId());
            return e.free(), r;
        }
    };
    xd = class {
        constructor(t, e){
            this.origin = t, this.dir = e;
        }
        pointAt(t) {
            return {
                x: this.origin.x + this.dir.x * t,
                y: this.origin.y + this.dir.y * t,
                z: this.origin.z + this.dir.z * t
            };
        }
    };
    ut = class {
        constructor(t, e, r, n){
            this.featureType = st.Unknown, this.featureId = void 0, this.timeOfImpact = t, this.normal = e, n !== void 0 && (this.featureId = n), r !== void 0 && (this.featureType = r);
        }
        static fromRaw(t) {
            if (!t) return null;
            const e = new ut(t.time_of_impact(), c.fromRaw(t.normal()), t.featureType(), t.featureId());
            return t.free(), e;
        }
    };
    dt = class {
        constructor(t, e, r, n, a){
            this.featureType = st.Unknown, this.featureId = void 0, this.collider = t, this.timeOfImpact = e, this.normal = r, a !== void 0 && (this.featureId = a), n !== void 0 && (this.featureType = n);
        }
        static fromRaw(t, e) {
            if (!e) return null;
            const r = new dt(t.get(e.colliderHandle()), e.time_of_impact(), c.fromRaw(e.normal()), e.featureType(), e.featureId());
            return e.free(), r;
        }
    };
    Ht = class {
        constructor(t, e){
            this.collider = t, this.timeOfImpact = e;
        }
        static fromRaw(t, e) {
            if (!e) return null;
            const r = new Ht(t.get(e.colliderHandle()), e.timeOfImpact());
            return e.free(), r;
        }
    };
    at = class {
        constructor(t, e, r, n, a){
            this.time_of_impact = t, this.witness1 = e, this.witness2 = r, this.normal1 = n, this.normal2 = a;
        }
        static fromRaw(t, e) {
            if (!e) return null;
            const r = new at(e.time_of_impact(), c.fromRaw(e.witness1()), c.fromRaw(e.witness2()), c.fromRaw(e.normal1()), c.fromRaw(e.normal2()));
            return e.free(), r;
        }
    };
    gt = class extends at {
        constructor(t, e, r, n, a, o){
            super(e, r, n, a, o), this.collider = t;
        }
        static fromRaw(t, e) {
            if (!e) return null;
            const r = new gt(t.get(e.colliderHandle()), e.time_of_impact(), c.fromRaw(e.witness1()), c.fromRaw(e.witness2()), c.fromRaw(e.normal1()), c.fromRaw(e.normal2()));
            return e.free(), r;
        }
    };
    T = class {
        static fromRaw(t, e) {
            const r = t.coShapeType(e);
            let n, a, o, w, h, d, p;
            switch(r){
                case M.Ball:
                    return new Ce(t.coRadius(e));
                case M.Cuboid:
                    return n = t.coHalfExtents(e), new Ie(n.x, n.y, n.z);
                case M.RoundCuboid:
                    return n = t.coHalfExtents(e), a = t.coRoundRadius(e), new xe(n.x, n.y, n.z, a);
                case M.Capsule:
                    return h = t.coHalfHeight(e), d = t.coRadius(e), new Ee(h, d);
                case M.Segment:
                    return o = t.coVertices(e), new Ae(c.new(o[0], o[1], o[2]), c.new(o[3], o[4], o[5]));
                case M.Polyline:
                    return o = t.coVertices(e), w = t.coIndices(e), new Fe(o, w);
                case M.Triangle:
                    return o = t.coVertices(e), new Pe(c.new(o[0], o[1], o[2]), c.new(o[3], o[4], o[5]), c.new(o[6], o[7], o[8]));
                case M.RoundTriangle:
                    return o = t.coVertices(e), a = t.coRoundRadius(e), new je(c.new(o[0], o[1], o[2]), c.new(o[3], o[4], o[5]), c.new(o[6], o[7], o[8]), a);
                case M.HalfSpace:
                    return p = c.fromRaw(t.coHalfspaceNormal(e)), new Wr(p);
                case M.Voxels:
                    const u = t.coVoxelData(e), g = t.coVoxelSize(e);
                    return new ze(u, g);
                case M.TriMesh:
                    o = t.coVertices(e), w = t.coIndices(e);
                    const m = t.coTriMeshFlags(e);
                    return new Te(o, w, m);
                case M.HeightField:
                    const I = t.coHeightfieldScale(e), k = t.coHeightfieldHeights(e), N = t.coHeightfieldNRows(e), W = t.coHeightfieldNCols(e), G = t.coHeightFieldFlags(e);
                    return new Me(N, W, k, I, G);
                case M.ConvexPolyhedron:
                    return o = t.coVertices(e), w = t.coIndices(e), new Ct(o, w);
                case M.RoundConvexPolyhedron:
                    return o = t.coVertices(e), w = t.coIndices(e), a = t.coRoundRadius(e), new It(o, w, a);
                case M.Cylinder:
                    return h = t.coHalfHeight(e), d = t.coRadius(e), new De(h, d);
                case M.RoundCylinder:
                    return h = t.coHalfHeight(e), d = t.coRadius(e), a = t.coRoundRadius(e), new He(h, d, a);
                case M.Cone:
                    return h = t.coHalfHeight(e), d = t.coRadius(e), new ke(h, d);
                case M.RoundCone:
                    return h = t.coHalfHeight(e), d = t.coRadius(e), a = t.coRoundRadius(e), new Le(h, d, a);
                default:
                    throw new Error("unknown shape type: " + r);
            }
        }
        castShape(t, e, r, n, a, o, w, h, d, p) {
            let u = c.intoRaw(t), g = y.intoRaw(e), m = c.intoRaw(r), I = c.intoRaw(a), k = y.intoRaw(o), N = c.intoRaw(w), W = this.intoRaw(), G = n.intoRaw(), Q = at.fromRaw(null, W.castShape(u, g, m, G, I, k, N, h, d, p));
            return u.free(), g.free(), m.free(), I.free(), k.free(), N.free(), W.free(), G.free(), Q;
        }
        intersectsShape(t, e, r, n, a) {
            let o = c.intoRaw(t), w = y.intoRaw(e), h = c.intoRaw(n), d = y.intoRaw(a), p = this.intoRaw(), u = r.intoRaw(), g = p.intersectsShape(o, w, u, h, d);
            return o.free(), w.free(), h.free(), d.free(), p.free(), u.free(), g;
        }
        contactShape(t, e, r, n, a, o) {
            let w = c.intoRaw(t), h = y.intoRaw(e), d = c.intoRaw(n), p = y.intoRaw(a), u = this.intoRaw(), g = r.intoRaw(), m = nt.fromRaw(u.contactShape(w, h, g, d, p, o));
            return w.free(), h.free(), d.free(), p.free(), u.free(), g.free(), m;
        }
        containsPoint(t, e, r) {
            let n = c.intoRaw(t), a = y.intoRaw(e), o = c.intoRaw(r), w = this.intoRaw(), h = w.containsPoint(n, a, o);
            return n.free(), a.free(), o.free(), w.free(), h;
        }
        projectPoint(t, e, r, n) {
            let a = c.intoRaw(t), o = y.intoRaw(e), w = c.intoRaw(r), h = this.intoRaw(), d = pt.fromRaw(h.projectPoint(a, o, w, n));
            return a.free(), o.free(), w.free(), h.free(), d;
        }
        intersectsRay(t, e, r, n) {
            let a = c.intoRaw(e), o = y.intoRaw(r), w = c.intoRaw(t.origin), h = c.intoRaw(t.dir), d = this.intoRaw(), p = d.intersectsRay(a, o, w, h, n);
            return a.free(), o.free(), w.free(), h.free(), d.free(), p;
        }
        castRay(t, e, r, n, a) {
            let o = c.intoRaw(e), w = y.intoRaw(r), h = c.intoRaw(t.origin), d = c.intoRaw(t.dir), p = this.intoRaw(), u = p.castRay(o, w, h, d, n, a);
            return o.free(), w.free(), h.free(), d.free(), p.free(), u;
        }
        castRayAndGetNormal(t, e, r, n, a) {
            let o = c.intoRaw(e), w = y.intoRaw(r), h = c.intoRaw(t.origin), d = c.intoRaw(t.dir), p = this.intoRaw(), u = ut.fromRaw(p.castRayAndGetNormal(o, w, h, d, n, a));
            return o.free(), w.free(), h.free(), d.free(), p.free(), u;
        }
    };
    (function(s) {
        s[s.Ball = 0] = "Ball", s[s.Cuboid = 1] = "Cuboid", s[s.Capsule = 2] = "Capsule", s[s.Segment = 3] = "Segment", s[s.Polyline = 4] = "Polyline", s[s.Triangle = 5] = "Triangle", s[s.TriMesh = 6] = "TriMesh", s[s.HeightField = 7] = "HeightField", s[s.ConvexPolyhedron = 9] = "ConvexPolyhedron", s[s.Cylinder = 10] = "Cylinder", s[s.Cone = 11] = "Cone", s[s.RoundCuboid = 12] = "RoundCuboid", s[s.RoundTriangle = 13] = "RoundTriangle", s[s.RoundCylinder = 14] = "RoundCylinder", s[s.RoundCone = 15] = "RoundCone", s[s.RoundConvexPolyhedron = 16] = "RoundConvexPolyhedron", s[s.HalfSpace = 17] = "HalfSpace", s[s.Voxels = 18] = "Voxels";
    })(j || (j = {}));
    (function(s) {
        s[s.FIX_INTERNAL_EDGES = 1] = "FIX_INTERNAL_EDGES";
    })(_e || (_e = {}));
    (function(s) {
        s[s.DELETE_BAD_TOPOLOGY_TRIANGLES = 4] = "DELETE_BAD_TOPOLOGY_TRIANGLES", s[s.ORIENTED = 8] = "ORIENTED", s[s.MERGE_DUPLICATE_VERTICES = 16] = "MERGE_DUPLICATE_VERTICES", s[s.DELETE_DEGENERATE_TRIANGLES = 32] = "DELETE_DEGENERATE_TRIANGLES", s[s.DELETE_DUPLICATE_TRIANGLES = 64] = "DELETE_DUPLICATE_TRIANGLES", s[s.FIX_INTERNAL_EDGES = 144] = "FIX_INTERNAL_EDGES";
    })(le || (le = {}));
    Ce = class extends T {
        constructor(t){
            super(), this.type = j.Ball, this.radius = t;
        }
        intoRaw() {
            return b.ball(this.radius);
        }
    };
    Wr = class extends T {
        constructor(t){
            super(), this.type = j.HalfSpace, this.normal = t;
        }
        intoRaw() {
            let t = c.intoRaw(this.normal), e = b.halfspace(t);
            return t.free(), e;
        }
    };
    Ie = class extends T {
        constructor(t, e, r){
            super(), this.type = j.Cuboid, this.halfExtents = c.new(t, e, r);
        }
        intoRaw() {
            return b.cuboid(this.halfExtents.x, this.halfExtents.y, this.halfExtents.z);
        }
    };
    xe = class extends T {
        constructor(t, e, r, n){
            super(), this.type = j.RoundCuboid, this.halfExtents = c.new(t, e, r), this.borderRadius = n;
        }
        intoRaw() {
            return b.roundCuboid(this.halfExtents.x, this.halfExtents.y, this.halfExtents.z, this.borderRadius);
        }
    };
    Ee = class extends T {
        constructor(t, e){
            super(), this.type = j.Capsule, this.halfHeight = t, this.radius = e;
        }
        intoRaw() {
            return b.capsule(this.halfHeight, this.radius);
        }
    };
    Ae = class extends T {
        constructor(t, e){
            super(), this.type = j.Segment, this.a = t, this.b = e;
        }
        intoRaw() {
            let t = c.intoRaw(this.a), e = c.intoRaw(this.b), r = b.segment(t, e);
            return t.free(), e.free(), r;
        }
    };
    Pe = class extends T {
        constructor(t, e, r){
            super(), this.type = j.Triangle, this.a = t, this.b = e, this.c = r;
        }
        intoRaw() {
            let t = c.intoRaw(this.a), e = c.intoRaw(this.b), r = c.intoRaw(this.c), n = b.triangle(t, e, r);
            return t.free(), e.free(), r.free(), n;
        }
    };
    je = class extends T {
        constructor(t, e, r, n){
            super(), this.type = j.RoundTriangle, this.a = t, this.b = e, this.c = r, this.borderRadius = n;
        }
        intoRaw() {
            let t = c.intoRaw(this.a), e = c.intoRaw(this.b), r = c.intoRaw(this.c), n = b.roundTriangle(t, e, r, this.borderRadius);
            return t.free(), e.free(), r.free(), n;
        }
    };
    Fe = class extends T {
        constructor(t, e){
            super(), this.type = j.Polyline, this.vertices = t, this.indices = e ?? new Uint32Array(0);
        }
        intoRaw() {
            return b.polyline(this.vertices, this.indices);
        }
    };
    ze = class extends T {
        constructor(t, e){
            super(), this.type = j.Voxels, this.data = t, this.voxelSize = e;
        }
        intoRaw() {
            let t = c.intoRaw(this.voxelSize), e;
            return this.data instanceof Int32Array ? e = b.voxels(t, this.data) : e = b.voxelsFromPoints(t, this.data), t.free(), e;
        }
    };
    Te = class extends T {
        constructor(t, e, r){
            super(), this.type = j.TriMesh, this.vertices = t, this.indices = e, this.flags = r;
        }
        intoRaw() {
            return b.trimesh(this.vertices, this.indices, this.flags);
        }
    };
    Ct = class extends T {
        constructor(t, e){
            super(), this.type = j.ConvexPolyhedron, this.vertices = t, this.indices = e;
        }
        intoRaw() {
            return this.indices ? b.convexMesh(this.vertices, this.indices) : b.convexHull(this.vertices);
        }
    };
    It = class extends T {
        constructor(t, e, r){
            super(), this.type = j.RoundConvexPolyhedron, this.vertices = t, this.indices = e, this.borderRadius = r;
        }
        intoRaw() {
            return this.indices ? b.roundConvexMesh(this.vertices, this.indices, this.borderRadius) : b.roundConvexHull(this.vertices, this.borderRadius);
        }
    };
    Me = class extends T {
        constructor(t, e, r, n, a){
            super(), this.type = j.HeightField, this.nrows = t, this.ncols = e, this.heights = r, this.scale = n, this.flags = a;
        }
        intoRaw() {
            let t = c.intoRaw(this.scale), e = b.heightfield(this.nrows, this.ncols, this.heights, t, this.flags);
            return t.free(), e;
        }
    };
    De = class extends T {
        constructor(t, e){
            super(), this.type = j.Cylinder, this.halfHeight = t, this.radius = e;
        }
        intoRaw() {
            return b.cylinder(this.halfHeight, this.radius);
        }
    };
    He = class extends T {
        constructor(t, e, r){
            super(), this.type = j.RoundCylinder, this.borderRadius = r, this.halfHeight = t, this.radius = e;
        }
        intoRaw() {
            return b.roundCylinder(this.halfHeight, this.radius, this.borderRadius);
        }
    };
    ke = class extends T {
        constructor(t, e){
            super(), this.type = j.Cone, this.halfHeight = t, this.radius = e;
        }
        intoRaw() {
            return b.cone(this.halfHeight, this.radius);
        }
    };
    Le = class extends T {
        constructor(t, e, r){
            super(), this.type = j.RoundCone, this.halfHeight = t, this.radius = e, this.borderRadius = r;
        }
        intoRaw() {
            return b.roundCone(this.halfHeight, this.radius, this.borderRadius);
        }
    };
    Gr = class {
        free() {
            this.raw && this.raw.free(), this.raw = void 0;
        }
        constructor(t){
            this.raw = t || new wi;
        }
        step(t, e, r, n, a, o, w, h, d, p, u, g) {
            let m = c.intoRaw(t);
            u ? this.raw.stepWithEvents(m, e.raw, r.raw, n.raw, a.raw, o.raw, w.raw, h.raw, d.raw, p.raw, u.raw, g, g ? g.filterContactPair : null, g ? g.filterIntersectionPair : null) : this.raw.step(m, e.raw, r.raw, n.raw, a.raw, o.raw, w.raw, h.raw, d.raw, p.raw), m.free();
        }
    };
    (function(s) {
        s[s.EXCLUDE_FIXED = 1] = "EXCLUDE_FIXED", s[s.EXCLUDE_KINEMATIC = 2] = "EXCLUDE_KINEMATIC", s[s.EXCLUDE_DYNAMIC = 4] = "EXCLUDE_DYNAMIC", s[s.EXCLUDE_SENSORS = 8] = "EXCLUDE_SENSORS", s[s.EXCLUDE_SOLIDS = 16] = "EXCLUDE_SOLIDS", s[s.ONLY_DYNAMIC = 3] = "ONLY_DYNAMIC", s[s.ONLY_KINEMATIC = 5] = "ONLY_KINEMATIC", s[s.ONLY_FIXED = 6] = "ONLY_FIXED";
    })(ce || (ce = {}));
    Or = class {
        free() {
            this.raw && this.raw.free(), this.raw = void 0;
        }
        constructor(t){
            this.raw = t || new ye;
        }
        update(t) {
            this.raw.update(t.raw);
        }
        castRay(t, e, r, n, a, o, w, h, d, p) {
            let u = c.intoRaw(r.origin), g = c.intoRaw(r.dir), m = Ht.fromRaw(e, this.raw.castRay(t.raw, e.raw, u, g, n, a, o, w, h, d, p));
            return u.free(), g.free(), m;
        }
        castRayAndGetNormal(t, e, r, n, a, o, w, h, d, p) {
            let u = c.intoRaw(r.origin), g = c.intoRaw(r.dir), m = dt.fromRaw(e, this.raw.castRayAndGetNormal(t.raw, e.raw, u, g, n, a, o, w, h, d, p));
            return u.free(), g.free(), m;
        }
        intersectionsWithRay(t, e, r, n, a, o, w, h, d, p, u) {
            let g = c.intoRaw(r.origin), m = c.intoRaw(r.dir), I = (k)=>o(dt.fromRaw(e, k));
            this.raw.intersectionsWithRay(t.raw, e.raw, g, m, n, a, I, w, h, d, p, u), g.free(), m.free();
        }
        intersectionWithShape(t, e, r, n, a, o, w, h, d, p) {
            let u = c.intoRaw(r), g = y.intoRaw(n), m = a.intoRaw(), I = this.raw.intersectionWithShape(t.raw, e.raw, u, g, m, o, w, h, d, p);
            return u.free(), g.free(), m.free(), I;
        }
        projectPoint(t, e, r, n, a, o, w, h, d) {
            let p = c.intoRaw(r), u = ht.fromRaw(e, this.raw.projectPoint(t.raw, e.raw, p, n, a, o, w, h, d));
            return p.free(), u;
        }
        projectPointAndGetFeature(t, e, r, n, a, o, w, h) {
            let d = c.intoRaw(r), p = ht.fromRaw(e, this.raw.projectPointAndGetFeature(t.raw, e.raw, d, n, a, o, w, h));
            return d.free(), p;
        }
        intersectionsWithPoint(t, e, r, n, a, o, w, h, d) {
            let p = c.intoRaw(r);
            this.raw.intersectionsWithPoint(t.raw, e.raw, p, n, a, o, w, h, d), p.free();
        }
        castShape(t, e, r, n, a, o, w, h, d, p, u, g, m, I) {
            let k = c.intoRaw(r), N = y.intoRaw(n), W = c.intoRaw(a), G = o.intoRaw(), Q = gt.fromRaw(e, this.raw.castShape(t.raw, e.raw, k, N, W, G, w, h, d, p, u, g, m, I));
            return k.free(), N.free(), W.free(), G.free(), Q;
        }
        intersectionsWithShape(t, e, r, n, a, o, w, h, d, p, u) {
            let g = c.intoRaw(r), m = y.intoRaw(n), I = a.intoRaw();
            this.raw.intersectionsWithShape(t.raw, e.raw, g, m, I, o, w, h, d, p, u), g.free(), m.free(), I.free();
        }
        collidersWithAabbIntersectingAabb(t, e, r) {
            let n = c.intoRaw(t), a = c.intoRaw(e);
            this.raw.collidersWithAabbIntersectingAabb(n, a, r), n.free(), a.free();
        }
    };
    we = class {
        free() {
            this.raw && this.raw.free(), this.raw = void 0;
        }
        constructor(t){
            this.raw = t || new di;
        }
        serializeAll(t, e, r, n, a, o, w, h, d) {
            let p = c.intoRaw(t);
            const u = this.raw.serializeAll(p, e.raw, r.raw, n.raw, a.raw, o.raw, w.raw, h.raw, d.raw);
            return p.free(), u;
        }
        deserializeAll(t) {
            return kt.fromRaw(this.raw.deserializeAll(t));
        }
    };
    Br = class {
        constructor(t, e){
            this.vertices = t, this.colors = e;
        }
    };
    qr = class {
        free() {
            this.raw && this.raw.free(), this.raw = void 0, this.vertices = void 0, this.colors = void 0;
        }
        constructor(t){
            this.raw = t || new _i;
        }
        render(t, e, r, n, a, o, w) {
            this.raw.render(t.raw, e.raw, r.raw, n.raw, a.raw, o, e.castClosure(w)), this.vertices = this.raw.vertices(), this.colors = this.raw.colors();
        }
    };
    Vr = class {
    };
    Ur = class {
        constructor(t, e, r, n, a){
            this.params = e, this.bodies = r, this.colliders = n, this.queries = a, this.raw = new ci(t), this.rawCharacterCollision = new gr, this._applyImpulsesToDynamicBodies = !1, this._characterMass = null;
        }
        free() {
            this.raw && (this.raw.free(), this.rawCharacterCollision.free()), this.raw = void 0, this.rawCharacterCollision = void 0;
        }
        up() {
            return this.raw.up();
        }
        setUp(t) {
            let e = c.intoRaw(t);
            return this.raw.setUp(e);
        }
        applyImpulsesToDynamicBodies() {
            return this._applyImpulsesToDynamicBodies;
        }
        setApplyImpulsesToDynamicBodies(t) {
            this._applyImpulsesToDynamicBodies = t;
        }
        characterMass() {
            return this._characterMass;
        }
        setCharacterMass(t) {
            this._characterMass = t;
        }
        offset() {
            return this.raw.offset();
        }
        setOffset(t) {
            this.raw.setOffset(t);
        }
        normalNudgeFactor() {
            return this.raw.normalNudgeFactor();
        }
        setNormalNudgeFactor(t) {
            this.raw.setNormalNudgeFactor(t);
        }
        slideEnabled() {
            return this.raw.slideEnabled();
        }
        setSlideEnabled(t) {
            this.raw.setSlideEnabled(t);
        }
        autostepMaxHeight() {
            return this.raw.autostepMaxHeight();
        }
        autostepMinWidth() {
            return this.raw.autostepMinWidth();
        }
        autostepIncludesDynamicBodies() {
            return this.raw.autostepIncludesDynamicBodies();
        }
        autostepEnabled() {
            return this.raw.autostepEnabled();
        }
        enableAutostep(t, e, r) {
            this.raw.enableAutostep(t, e, r);
        }
        disableAutostep() {
            return this.raw.disableAutostep();
        }
        maxSlopeClimbAngle() {
            return this.raw.maxSlopeClimbAngle();
        }
        setMaxSlopeClimbAngle(t) {
            this.raw.setMaxSlopeClimbAngle(t);
        }
        minSlopeSlideAngle() {
            return this.raw.minSlopeSlideAngle();
        }
        setMinSlopeSlideAngle(t) {
            this.raw.setMinSlopeSlideAngle(t);
        }
        snapToGroundDistance() {
            return this.raw.snapToGroundDistance();
        }
        enableSnapToGround(t) {
            this.raw.enableSnapToGround(t);
        }
        disableSnapToGround() {
            this.raw.disableSnapToGround();
        }
        snapToGroundEnabled() {
            return this.raw.snapToGroundEnabled();
        }
        computeColliderMovement(t, e, r, n, a) {
            let o = c.intoRaw(e);
            this.raw.computeColliderMovement(this.params.dt, this.bodies.raw, this.colliders.raw, this.queries.raw, t.handle, o, this._applyImpulsesToDynamicBodies, this._characterMass, r, n, this.colliders.castClosure(a)), o.free();
        }
        computedMovement() {
            return c.fromRaw(this.raw.computedMovement());
        }
        computedGrounded() {
            return this.raw.computedGrounded();
        }
        numComputedCollisions() {
            return this.raw.numComputedCollisions();
        }
        computedCollision(t, e) {
            if (this.raw.computedCollision(t, this.rawCharacterCollision)) {
                let r = this.rawCharacterCollision;
                return e = e ?? new Vr, e.translationDeltaApplied = c.fromRaw(r.translationDeltaApplied()), e.translationDeltaRemaining = c.fromRaw(r.translationDeltaRemaining()), e.toi = r.toi(), e.witness1 = c.fromRaw(r.worldWitness1()), e.witness2 = c.fromRaw(r.worldWitness2()), e.normal1 = c.fromRaw(r.worldNormal1()), e.normal2 = c.fromRaw(r.worldNormal2()), e.collider = this.colliders.get(r.handle()), e;
            } else return null;
        }
    };
    (function(s) {
        s[s.None = 0] = "None", s[s.LinX = 1] = "LinX", s[s.LinY = 2] = "LinY", s[s.LinZ = 4] = "LinZ", s[s.AngX = 8] = "AngX", s[s.AngY = 16] = "AngY", s[s.AngZ = 32] = "AngZ", s[s.AllLin = 7] = "AllLin", s[s.AllAng = 56] = "AllAng", s[s.All = 63] = "All";
    })(he || (he = {}));
    Xr = class {
        constructor(t, e, r, n, a, o){
            this.params = t, this.bodies = e, this.raw = new hi(r, n, a, o);
        }
        free() {
            this.raw && this.raw.free(), this.raw = void 0;
        }
        setKp(t, e) {
            this.raw.set_kp(t, e);
        }
        setKi(t, e) {
            this.raw.set_kp(t, e);
        }
        setKd(t, e) {
            this.raw.set_kp(t, e);
        }
        setAxes(t) {
            this.raw.set_axes_mask(t);
        }
        resetIntegrals() {
            this.raw.reset_integrals();
        }
        applyLinearCorrection(t, e, r) {
            let n = c.intoRaw(e), a = c.intoRaw(r);
            this.raw.apply_linear_correction(this.params.dt, this.bodies.raw, t.handle, n, a), n.free(), a.free();
        }
        applyAngularCorrection(t, e, r) {
            let n = y.intoRaw(e), a = c.intoRaw(r);
            this.raw.apply_angular_correction(this.params.dt, this.bodies.raw, t.handle, n, a), n.free(), a.free();
        }
        linearCorrection(t, e, r) {
            let n = c.intoRaw(e), a = c.intoRaw(r), o = this.raw.linear_correction(this.params.dt, this.bodies.raw, t.handle, n, a);
            return n.free(), a.free(), c.fromRaw(o);
        }
        angularCorrection(t, e, r) {
            let n = y.intoRaw(e), a = c.intoRaw(r), o = this.raw.angular_correction(this.params.dt, this.bodies.raw, t.handle, n, a);
            return n.free(), a.free(), c.fromRaw(o);
        }
    };
    Jr = class {
        constructor(t, e, r, n){
            this.raw = new li(t.handle), this.bodies = e, this.colliders = r, this.queries = n, this._chassis = t;
        }
        free() {
            this.raw && this.raw.free(), this.raw = void 0;
        }
        updateVehicle(t, e, r, n) {
            this.raw.update_vehicle(t, this.bodies.raw, this.colliders.raw, this.queries.raw, e, r, this.colliders.castClosure(n));
        }
        currentVehicleSpeed() {
            return this.raw.current_vehicle_speed();
        }
        chassis() {
            return this._chassis;
        }
        get indexUpAxis() {
            return this.raw.index_up_axis();
        }
        set indexUpAxis(t) {
            this.raw.set_index_up_axis(t);
        }
        get indexForwardAxis() {
            return this.raw.index_forward_axis();
        }
        set setIndexForwardAxis(t) {
            this.raw.set_index_forward_axis(t);
        }
        addWheel(t, e, r, n, a) {
            let o = c.intoRaw(t), w = c.intoRaw(e), h = c.intoRaw(r);
            this.raw.add_wheel(o, w, h, n, a), o.free(), w.free(), h.free();
        }
        numWheels() {
            return this.raw.num_wheels();
        }
        wheelChassisConnectionPointCs(t) {
            return c.fromRaw(this.raw.wheel_chassis_connection_point_cs(t));
        }
        setWheelChassisConnectionPointCs(t, e) {
            let r = c.intoRaw(e);
            this.raw.set_wheel_chassis_connection_point_cs(t, r), r.free();
        }
        wheelSuspensionRestLength(t) {
            return this.raw.wheel_suspension_rest_length(t);
        }
        setWheelSuspensionRestLength(t, e) {
            this.raw.set_wheel_suspension_rest_length(t, e);
        }
        wheelMaxSuspensionTravel(t) {
            return this.raw.wheel_max_suspension_travel(t);
        }
        setWheelMaxSuspensionTravel(t, e) {
            this.raw.set_wheel_max_suspension_travel(t, e);
        }
        wheelRadius(t) {
            return this.raw.wheel_radius(t);
        }
        setWheelRadius(t, e) {
            this.raw.set_wheel_radius(t, e);
        }
        wheelSuspensionStiffness(t) {
            return this.raw.wheel_suspension_stiffness(t);
        }
        setWheelSuspensionStiffness(t, e) {
            this.raw.set_wheel_suspension_stiffness(t, e);
        }
        wheelSuspensionCompression(t) {
            return this.raw.wheel_suspension_compression(t);
        }
        setWheelSuspensionCompression(t, e) {
            this.raw.set_wheel_suspension_compression(t, e);
        }
        wheelSuspensionRelaxation(t) {
            return this.raw.wheel_suspension_relaxation(t);
        }
        setWheelSuspensionRelaxation(t, e) {
            this.raw.set_wheel_suspension_relaxation(t, e);
        }
        wheelMaxSuspensionForce(t) {
            return this.raw.wheel_max_suspension_force(t);
        }
        setWheelMaxSuspensionForce(t, e) {
            this.raw.set_wheel_max_suspension_force(t, e);
        }
        wheelBrake(t) {
            return this.raw.wheel_brake(t);
        }
        setWheelBrake(t, e) {
            this.raw.set_wheel_brake(t, e);
        }
        wheelSteering(t) {
            return this.raw.wheel_steering(t);
        }
        setWheelSteering(t, e) {
            this.raw.set_wheel_steering(t, e);
        }
        wheelEngineForce(t) {
            return this.raw.wheel_engine_force(t);
        }
        setWheelEngineForce(t, e) {
            this.raw.set_wheel_engine_force(t, e);
        }
        wheelDirectionCs(t) {
            return c.fromRaw(this.raw.wheel_direction_cs(t));
        }
        setWheelDirectionCs(t, e) {
            let r = c.intoRaw(e);
            this.raw.set_wheel_direction_cs(t, r), r.free();
        }
        wheelAxleCs(t) {
            return c.fromRaw(this.raw.wheel_axle_cs(t));
        }
        setWheelAxleCs(t, e) {
            let r = c.intoRaw(e);
            this.raw.set_wheel_axle_cs(t, r), r.free();
        }
        wheelFrictionSlip(t) {
            return this.raw.wheel_friction_slip(t);
        }
        setWheelFrictionSlip(t, e) {
            this.raw.set_wheel_friction_slip(t, e);
        }
        wheelSideFrictionStiffness(t) {
            return this.raw.wheel_side_friction_stiffness(t);
        }
        setWheelSideFrictionStiffness(t, e) {
            this.raw.set_wheel_side_friction_stiffness(t, e);
        }
        wheelRotation(t) {
            return this.raw.wheel_rotation(t);
        }
        wheelForwardImpulse(t) {
            return this.raw.wheel_forward_impulse(t);
        }
        wheelSideImpulse(t) {
            return this.raw.wheel_side_impulse(t);
        }
        wheelSuspensionForce(t) {
            return this.raw.wheel_suspension_force(t);
        }
        wheelContactNormal(t) {
            return c.fromRaw(this.raw.wheel_contact_normal_ws(t));
        }
        wheelContactPoint(t) {
            return c.fromRaw(this.raw.wheel_contact_point_ws(t));
        }
        wheelSuspensionLength(t) {
            return this.raw.wheel_suspension_length(t);
        }
        wheelHardPoint(t) {
            return c.fromRaw(this.raw.wheel_hard_point_ws(t));
        }
        wheelIsInContact(t) {
            return this.raw.wheel_is_in_contact(t);
        }
        wheelGroundObject(t) {
            return this.colliders.get(this.raw.wheel_ground_object(t));
        }
    };
    kt = class {
        free() {
            this.integrationParameters.free(), this.islands.free(), this.broadPhase.free(), this.narrowPhase.free(), this.bodies.free(), this.colliders.free(), this.impulseJoints.free(), this.multibodyJoints.free(), this.ccdSolver.free(), this.queryPipeline.free(), this.physicsPipeline.free(), this.serializationPipeline.free(), this.debugRenderPipeline.free(), this.characterControllers.forEach((t)=>t.free()), this.pidControllers.forEach((t)=>t.free()), this.vehicleControllers.forEach((t)=>t.free()), this.integrationParameters = void 0, this.islands = void 0, this.broadPhase = void 0, this.narrowPhase = void 0, this.bodies = void 0, this.colliders = void 0, this.ccdSolver = void 0, this.impulseJoints = void 0, this.multibodyJoints = void 0, this.queryPipeline = void 0, this.physicsPipeline = void 0, this.serializationPipeline = void 0, this.debugRenderPipeline = void 0, this.characterControllers = void 0, this.pidControllers = void 0, this.vehicleControllers = void 0;
        }
        constructor(t, e, r, n, a, o, w, h, d, p, u, g, m, I){
            this.gravity = t, this.integrationParameters = new Sr(e), this.islands = new Hr(r), this.broadPhase = new kr(n), this.narrowPhase = new Lr(a), this.bodies = new yr(o), this.colliders = new Yr(w), this.impulseJoints = new Pr(h), this.multibodyJoints = new Mr(d), this.ccdSolver = new Dr(p), this.queryPipeline = new Or(u), this.physicsPipeline = new Gr(g), this.serializationPipeline = new we(m), this.debugRenderPipeline = new qr(I), this.characterControllers = new Set, this.pidControllers = new Set, this.vehicleControllers = new Set, this.impulseJoints.finalizeDeserialization(this.bodies), this.bodies.finalizeDeserialization(this.colliders), this.colliders.finalizeDeserialization(this.bodies);
        }
        static fromRaw(t) {
            return t ? new kt(c.fromRaw(t.takeGravity()), t.takeIntegrationParameters(), t.takeIslandManager(), t.takeBroadPhase(), t.takeNarrowPhase(), t.takeBodies(), t.takeColliders(), t.takeImpulseJoints(), t.takeMultibodyJoints()) : null;
        }
        takeSnapshot() {
            return this.serializationPipeline.serializeAll(this.gravity, this.integrationParameters, this.islands, this.broadPhase, this.narrowPhase, this.bodies, this.colliders, this.impulseJoints, this.multibodyJoints);
        }
        static restoreSnapshot(t) {
            return new we().deserializeAll(t);
        }
        debugRender(t, e) {
            return this.debugRenderPipeline.render(this.bodies, this.colliders, this.impulseJoints, this.multibodyJoints, this.narrowPhase, t, e), new Br(this.debugRenderPipeline.vertices, this.debugRenderPipeline.colors);
        }
        step(t, e) {
            this.physicsPipeline.step(this.gravity, this.integrationParameters, this.islands, this.broadPhase, this.narrowPhase, this.bodies, this.colliders, this.impulseJoints, this.multibodyJoints, this.ccdSolver, t, e), this.queryPipeline.update(this.colliders);
        }
        propagateModifiedBodyPositionsToColliders() {
            this.bodies.raw.propagateModifiedBodyPositionsToColliders(this.colliders.raw);
        }
        updateSceneQueries() {
            this.propagateModifiedBodyPositionsToColliders(), this.queryPipeline.update(this.colliders);
        }
        get timestep() {
            return this.integrationParameters.dt;
        }
        set timestep(t) {
            this.integrationParameters.dt = t;
        }
        get lengthUnit() {
            return this.integrationParameters.lengthUnit;
        }
        set lengthUnit(t) {
            this.integrationParameters.lengthUnit = t;
        }
        get numSolverIterations() {
            return this.integrationParameters.numSolverIterations;
        }
        set numSolverIterations(t) {
            this.integrationParameters.numSolverIterations = t;
        }
        get numAdditionalFrictionIterations() {
            return this.integrationParameters.numAdditionalFrictionIterations;
        }
        set numAdditionalFrictionIterations(t) {
            this.integrationParameters.numAdditionalFrictionIterations = t;
        }
        get numInternalPgsIterations() {
            return this.integrationParameters.numInternalPgsIterations;
        }
        set numInternalPgsIterations(t) {
            this.integrationParameters.numInternalPgsIterations = t;
        }
        switchToStandardPgsSolver() {
            this.integrationParameters.switchToStandardPgsSolver();
        }
        switchToSmallStepsPgsSolver() {
            this.integrationParameters.switchToSmallStepsPgsSolver();
        }
        switchToSmallStepsPgsSolverWithoutWarmstart() {
            this.integrationParameters.switchToSmallStepsPgsSolverWithoutWarmstart();
        }
        createRigidBody(t) {
            return this.bodies.createRigidBody(this.colliders, t);
        }
        createCharacterController(t) {
            let e = new Ur(t, this.integrationParameters, this.bodies, this.colliders, this.queryPipeline);
            return this.characterControllers.add(e), e;
        }
        removeCharacterController(t) {
            this.characterControllers.delete(t), t.free();
        }
        createPidController(t, e, r, n) {
            let a = new Xr(this.integrationParameters, this.bodies, t, e, r, n);
            return this.pidControllers.add(a), a;
        }
        removePidController(t) {
            this.pidControllers.delete(t), t.free();
        }
        createVehicleController(t) {
            let e = new Jr(t, this.bodies, this.colliders, this.queryPipeline);
            return this.vehicleControllers.add(e), e;
        }
        removeVehicleController(t) {
            this.vehicleControllers.delete(t), t.free();
        }
        createCollider(t, e) {
            let r = e ? e.handle : void 0;
            return this.colliders.createCollider(this.bodies, t, r);
        }
        createImpulseJoint(t, e, r, n) {
            return this.impulseJoints.createJoint(this.bodies, t, e.handle, r.handle, n);
        }
        createMultibodyJoint(t, e, r, n) {
            return this.multibodyJoints.createJoint(t, e.handle, r.handle, n);
        }
        getRigidBody(t) {
            return this.bodies.get(t);
        }
        getCollider(t) {
            return this.colliders.get(t);
        }
        getImpulseJoint(t) {
            return this.impulseJoints.get(t);
        }
        getMultibodyJoint(t) {
            return this.multibodyJoints.get(t);
        }
        removeRigidBody(t) {
            this.bodies && this.bodies.remove(t.handle, this.islands, this.colliders, this.impulseJoints, this.multibodyJoints);
        }
        removeCollider(t, e) {
            this.colliders && this.colliders.remove(t.handle, this.islands, this.bodies, e);
        }
        removeImpulseJoint(t, e) {
            this.impulseJoints && this.impulseJoints.remove(t.handle, e);
        }
        removeMultibodyJoint(t, e) {
            this.impulseJoints && this.multibodyJoints.remove(t.handle, e);
        }
        forEachCollider(t) {
            this.colliders.forEach(t);
        }
        forEachRigidBody(t) {
            this.bodies.forEach(t);
        }
        forEachActiveRigidBody(t) {
            this.bodies.forEachActiveRigidBody(this.islands, t);
        }
        castRay(t, e, r, n, a, o, w, h) {
            return this.queryPipeline.castRay(this.bodies, this.colliders, t, e, r, n, a, o ? o.handle : null, w ? w.handle : null, this.colliders.castClosure(h));
        }
        castRayAndGetNormal(t, e, r, n, a, o, w, h) {
            return this.queryPipeline.castRayAndGetNormal(this.bodies, this.colliders, t, e, r, n, a, o ? o.handle : null, w ? w.handle : null, this.colliders.castClosure(h));
        }
        intersectionsWithRay(t, e, r, n, a, o, w, h, d) {
            this.queryPipeline.intersectionsWithRay(this.bodies, this.colliders, t, e, r, n, a, o, w ? w.handle : null, h ? h.handle : null, this.colliders.castClosure(d));
        }
        intersectionWithShape(t, e, r, n, a, o, w, h) {
            let d = this.queryPipeline.intersectionWithShape(this.bodies, this.colliders, t, e, r, n, a, o ? o.handle : null, w ? w.handle : null, this.colliders.castClosure(h));
            return d != null ? this.colliders.get(d) : null;
        }
        projectPoint(t, e, r, n, a, o, w) {
            return this.queryPipeline.projectPoint(this.bodies, this.colliders, t, e, r, n, a ? a.handle : null, o ? o.handle : null, this.colliders.castClosure(w));
        }
        projectPointAndGetFeature(t, e, r, n, a, o) {
            return this.queryPipeline.projectPointAndGetFeature(this.bodies, this.colliders, t, e, r, n ? n.handle : null, a ? a.handle : null, this.colliders.castClosure(o));
        }
        intersectionsWithPoint(t, e, r, n, a, o, w) {
            this.queryPipeline.intersectionsWithPoint(this.bodies, this.colliders, t, this.colliders.castClosure(e), r, n, a ? a.handle : null, o ? o.handle : null, this.colliders.castClosure(w));
        }
        castShape(t, e, r, n, a, o, w, h, d, p, u, g) {
            return this.queryPipeline.castShape(this.bodies, this.colliders, t, e, r, n, a, o, w, h, d, p ? p.handle : null, u ? u.handle : null, this.colliders.castClosure(g));
        }
        intersectionsWithShape(t, e, r, n, a, o, w, h, d) {
            this.queryPipeline.intersectionsWithShape(this.bodies, this.colliders, t, e, r, this.colliders.castClosure(n), a, o, w ? w.handle : null, h ? h.handle : null, this.colliders.castClosure(d));
        }
        collidersWithAabbIntersectingAabb(t, e, r) {
            this.queryPipeline.collidersWithAabbIntersectingAabb(t, e, this.colliders.castClosure(r));
        }
        contactPairsWith(t, e) {
            this.narrowPhase.contactPairsWith(t.handle, this.colliders.castClosure(e));
        }
        intersectionPairsWith(t, e) {
            this.narrowPhase.intersectionPairsWith(t.handle, this.colliders.castClosure(e));
        }
        contactPair(t, e, r) {
            this.narrowPhase.contactPair(t.handle, e.handle, r);
        }
        intersectionPair(t, e) {
            return this.narrowPhase.intersectionPair(t.handle, e.handle);
        }
    };
    (function(s) {
        s[s.NONE = 0] = "NONE", s[s.COLLISION_EVENTS = 1] = "COLLISION_EVENTS", s[s.CONTACT_FORCE_EVENTS = 2] = "CONTACT_FORCE_EVENTS";
    })(xt || (xt = {}));
    Kr = class {
        free() {
            this.raw && this.raw.free(), this.raw = void 0;
        }
        collider1() {
            return this.raw.collider1();
        }
        collider2() {
            return this.raw.collider2();
        }
        totalForce() {
            return c.fromRaw(this.raw.total_force());
        }
        totalForceMagnitude() {
            return this.raw.total_force_magnitude();
        }
        maxForceDirection() {
            return c.fromRaw(this.raw.max_force_direction());
        }
        maxForceMagnitude() {
            return this.raw.max_force_magnitude();
        }
    };
    Ed = class {
        constructor(t, e){
            this.raw = e || new br(t);
        }
        free() {
            this.raw && this.raw.free(), this.raw = void 0;
        }
        drainCollisionEvents(t) {
            this.raw.drainCollisionEvents(t);
        }
        drainContactForceEvents(t) {
            let e = new Kr;
            this.raw.drainContactForceEvents((r)=>{
                e.raw = r, t(e), e.free();
            });
        }
        clear() {
            this.raw.clear();
        }
    };
    (function(s) {
        s[s.NONE = 0] = "NONE", s[s.FILTER_CONTACT_PAIRS = 1] = "FILTER_CONTACT_PAIRS", s[s.FILTER_INTERSECTION_PAIRS = 2] = "FILTER_INTERSECTION_PAIRS";
    })(Et || (Et = {}));
    (function(s) {
        s[s.EMPTY = 0] = "EMPTY", s[s.COMPUTE_IMPULSE = 1] = "COMPUTE_IMPULSE";
    })(de || (de = {}));
    (function(s) {
        s[s.DYNAMIC_DYNAMIC = 1] = "DYNAMIC_DYNAMIC", s[s.DYNAMIC_KINEMATIC = 12] = "DYNAMIC_KINEMATIC", s[s.DYNAMIC_FIXED = 2] = "DYNAMIC_FIXED", s[s.KINEMATIC_KINEMATIC = 52224] = "KINEMATIC_KINEMATIC", s[s.KINEMATIC_FIXED = 8704] = "KINEMATIC_FIXED", s[s.FIXED_FIXED = 32] = "FIXED_FIXED", s[s.DEFAULT = 15] = "DEFAULT", s[s.ALL = 60943] = "ALL";
    })(At || (At = {}));
    pe = class {
        constructor(t, e, r, n){
            this.colliderSet = t, this.handle = e, this._parent = r, this._shape = n;
        }
        finalizeDeserialization(t) {
            this.handle != null && (this._parent = t.get(this.colliderSet.raw.coParent(this.handle)));
        }
        ensureShapeIsCached() {
            this._shape || (this._shape = T.fromRaw(this.colliderSet.raw, this.handle));
        }
        get shape() {
            return this.ensureShapeIsCached(), this._shape;
        }
        clearShapeCache() {
            this._shape = null;
        }
        isValid() {
            return this.colliderSet.raw.contains(this.handle);
        }
        translation() {
            return c.fromRaw(this.colliderSet.raw.coTranslation(this.handle));
        }
        rotation() {
            return y.fromRaw(this.colliderSet.raw.coRotation(this.handle));
        }
        isSensor() {
            return this.colliderSet.raw.coIsSensor(this.handle);
        }
        setSensor(t) {
            this.colliderSet.raw.coSetSensor(this.handle, t);
        }
        setShape(t) {
            let e = t.intoRaw();
            this.colliderSet.raw.coSetShape(this.handle, e), e.free(), this._shape = t;
        }
        setEnabled(t) {
            this.colliderSet.raw.coSetEnabled(this.handle, t);
        }
        isEnabled() {
            return this.colliderSet.raw.coIsEnabled(this.handle);
        }
        setRestitution(t) {
            this.colliderSet.raw.coSetRestitution(this.handle, t);
        }
        setFriction(t) {
            this.colliderSet.raw.coSetFriction(this.handle, t);
        }
        frictionCombineRule() {
            return this.colliderSet.raw.coFrictionCombineRule(this.handle);
        }
        setFrictionCombineRule(t) {
            this.colliderSet.raw.coSetFrictionCombineRule(this.handle, t);
        }
        restitutionCombineRule() {
            return this.colliderSet.raw.coRestitutionCombineRule(this.handle);
        }
        setRestitutionCombineRule(t) {
            this.colliderSet.raw.coSetRestitutionCombineRule(this.handle, t);
        }
        setCollisionGroups(t) {
            this.colliderSet.raw.coSetCollisionGroups(this.handle, t);
        }
        setSolverGroups(t) {
            this.colliderSet.raw.coSetSolverGroups(this.handle, t);
        }
        contactSkin() {
            return this.colliderSet.raw.coContactSkin(this.handle);
        }
        setContactSkin(t) {
            return this.colliderSet.raw.coSetContactSkin(this.handle, t);
        }
        activeHooks() {
            return this.colliderSet.raw.coActiveHooks(this.handle);
        }
        setActiveHooks(t) {
            this.colliderSet.raw.coSetActiveHooks(this.handle, t);
        }
        activeEvents() {
            return this.colliderSet.raw.coActiveEvents(this.handle);
        }
        setActiveEvents(t) {
            this.colliderSet.raw.coSetActiveEvents(this.handle, t);
        }
        activeCollisionTypes() {
            return this.colliderSet.raw.coActiveCollisionTypes(this.handle);
        }
        setContactForceEventThreshold(t) {
            return this.colliderSet.raw.coSetContactForceEventThreshold(this.handle, t);
        }
        contactForceEventThreshold() {
            return this.colliderSet.raw.coContactForceEventThreshold(this.handle);
        }
        setActiveCollisionTypes(t) {
            this.colliderSet.raw.coSetActiveCollisionTypes(this.handle, t);
        }
        setDensity(t) {
            this.colliderSet.raw.coSetDensity(this.handle, t);
        }
        setMass(t) {
            this.colliderSet.raw.coSetMass(this.handle, t);
        }
        setMassProperties(t, e, r, n) {
            let a = c.intoRaw(e), o = c.intoRaw(r), w = y.intoRaw(n);
            this.colliderSet.raw.coSetMassProperties(this.handle, t, a, o, w), a.free(), o.free(), w.free();
        }
        setTranslation(t) {
            this.colliderSet.raw.coSetTranslation(this.handle, t.x, t.y, t.z);
        }
        setTranslationWrtParent(t) {
            this.colliderSet.raw.coSetTranslationWrtParent(this.handle, t.x, t.y, t.z);
        }
        setRotation(t) {
            this.colliderSet.raw.coSetRotation(this.handle, t.x, t.y, t.z, t.w);
        }
        setRotationWrtParent(t) {
            this.colliderSet.raw.coSetRotationWrtParent(this.handle, t.x, t.y, t.z, t.w);
        }
        shapeType() {
            return this.colliderSet.raw.coShapeType(this.handle);
        }
        halfExtents() {
            return c.fromRaw(this.colliderSet.raw.coHalfExtents(this.handle));
        }
        setHalfExtents(t) {
            const e = c.intoRaw(t);
            this.colliderSet.raw.coSetHalfExtents(this.handle, e);
        }
        radius() {
            return this.colliderSet.raw.coRadius(this.handle);
        }
        setRadius(t) {
            this.colliderSet.raw.coSetRadius(this.handle, t);
        }
        roundRadius() {
            return this.colliderSet.raw.coRoundRadius(this.handle);
        }
        setRoundRadius(t) {
            this.colliderSet.raw.coSetRoundRadius(this.handle, t);
        }
        halfHeight() {
            return this.colliderSet.raw.coHalfHeight(this.handle);
        }
        setHalfHeight(t) {
            this.colliderSet.raw.coSetHalfHeight(this.handle, t);
        }
        setVoxel(t, e, r, n) {
            this.colliderSet.raw.coSetVoxel(this.handle, t, e, r, n), this._shape = null;
        }
        propagateVoxelChange(t, e, r, n, a, o, w) {
            this.colliderSet.raw.coPropagateVoxelChange(this.handle, t.handle, e, r, n, a, o, w), this._shape = null;
        }
        combineVoxelStates(t, e, r, n) {
            this.colliderSet.raw.coCombineVoxelStates(this.handle, t.handle, e, r, n), this._shape = null;
        }
        vertices() {
            return this.colliderSet.raw.coVertices(this.handle);
        }
        indices() {
            return this.colliderSet.raw.coIndices(this.handle);
        }
        heightfieldHeights() {
            return this.colliderSet.raw.coHeightfieldHeights(this.handle);
        }
        heightfieldScale() {
            let t = this.colliderSet.raw.coHeightfieldScale(this.handle);
            return c.fromRaw(t);
        }
        heightfieldNRows() {
            return this.colliderSet.raw.coHeightfieldNRows(this.handle);
        }
        heightfieldNCols() {
            return this.colliderSet.raw.coHeightfieldNCols(this.handle);
        }
        parent() {
            return this._parent;
        }
        friction() {
            return this.colliderSet.raw.coFriction(this.handle);
        }
        restitution() {
            return this.colliderSet.raw.coRestitution(this.handle);
        }
        density() {
            return this.colliderSet.raw.coDensity(this.handle);
        }
        mass() {
            return this.colliderSet.raw.coMass(this.handle);
        }
        volume() {
            return this.colliderSet.raw.coVolume(this.handle);
        }
        collisionGroups() {
            return this.colliderSet.raw.coCollisionGroups(this.handle);
        }
        solverGroups() {
            return this.colliderSet.raw.coSolverGroups(this.handle);
        }
        containsPoint(t) {
            let e = c.intoRaw(t), r = this.colliderSet.raw.coContainsPoint(this.handle, e);
            return e.free(), r;
        }
        projectPoint(t, e) {
            let r = c.intoRaw(t), n = pt.fromRaw(this.colliderSet.raw.coProjectPoint(this.handle, r, e));
            return r.free(), n;
        }
        intersectsRay(t, e) {
            let r = c.intoRaw(t.origin), n = c.intoRaw(t.dir), a = this.colliderSet.raw.coIntersectsRay(this.handle, r, n, e);
            return r.free(), n.free(), a;
        }
        castShape(t, e, r, n, a, o, w, h) {
            let d = c.intoRaw(t), p = c.intoRaw(r), u = y.intoRaw(n), g = c.intoRaw(a), m = e.intoRaw(), I = at.fromRaw(this.colliderSet, this.colliderSet.raw.coCastShape(this.handle, d, m, p, u, g, o, w, h));
            return d.free(), p.free(), u.free(), g.free(), m.free(), I;
        }
        castCollider(t, e, r, n, a, o) {
            let w = c.intoRaw(t), h = c.intoRaw(r), d = gt.fromRaw(this.colliderSet, this.colliderSet.raw.coCastCollider(this.handle, w, e.handle, h, n, a, o));
            return w.free(), h.free(), d;
        }
        intersectsShape(t, e, r) {
            let n = c.intoRaw(e), a = y.intoRaw(r), o = t.intoRaw(), w = this.colliderSet.raw.coIntersectsShape(this.handle, o, n, a);
            return n.free(), a.free(), o.free(), w;
        }
        contactShape(t, e, r, n) {
            let a = c.intoRaw(e), o = y.intoRaw(r), w = t.intoRaw(), h = nt.fromRaw(this.colliderSet.raw.coContactShape(this.handle, w, a, o, n));
            return a.free(), o.free(), w.free(), h;
        }
        contactCollider(t, e) {
            return nt.fromRaw(this.colliderSet.raw.coContactCollider(this.handle, t.handle, e));
        }
        castRay(t, e, r) {
            let n = c.intoRaw(t.origin), a = c.intoRaw(t.dir), o = this.colliderSet.raw.coCastRay(this.handle, n, a, e, r);
            return n.free(), a.free(), o;
        }
        castRayAndGetNormal(t, e, r) {
            let n = c.intoRaw(t.origin), a = c.intoRaw(t.dir), o = ut.fromRaw(this.colliderSet.raw.coCastRayAndGetNormal(this.handle, n, a, e, r));
            return n.free(), a.free(), o;
        }
    };
    (function(s) {
        s[s.Density = 0] = "Density", s[s.Mass = 1] = "Mass", s[s.MassProps = 2] = "MassProps";
    })(tt || (tt = {}));
    P = class {
        constructor(t){
            this.enabled = !0, this.shape = t, this.massPropsMode = tt.Density, this.density = 1, this.friction = .5, this.restitution = 0, this.rotation = y.identity(), this.translation = c.zeros(), this.isSensor = !1, this.collisionGroups = 4294967295, this.solverGroups = 4294967295, this.frictionCombineRule = wt.Average, this.restitutionCombineRule = wt.Average, this.activeCollisionTypes = At.DEFAULT, this.activeEvents = xt.NONE, this.activeHooks = Et.NONE, this.mass = 0, this.centerOfMass = c.zeros(), this.contactForceEventThreshold = 0, this.contactSkin = 0, this.principalAngularInertia = c.zeros(), this.angularInertiaLocalFrame = y.identity();
        }
        static ball(t) {
            const e = new Ce(t);
            return new P(e);
        }
        static capsule(t, e) {
            const r = new Ee(t, e);
            return new P(r);
        }
        static segment(t, e) {
            const r = new Ae(t, e);
            return new P(r);
        }
        static triangle(t, e, r) {
            const n = new Pe(t, e, r);
            return new P(n);
        }
        static roundTriangle(t, e, r, n) {
            const a = new je(t, e, r, n);
            return new P(a);
        }
        static polyline(t, e) {
            const r = new Fe(t, e);
            return new P(r);
        }
        static voxels(t, e) {
            const r = new ze(t, e);
            return new P(r);
        }
        static trimesh(t, e, r) {
            const n = new Te(t, e, r);
            return new P(n);
        }
        static cuboid(t, e, r) {
            const n = new Ie(t, e, r);
            return new P(n);
        }
        static roundCuboid(t, e, r, n) {
            const a = new xe(t, e, r, n);
            return new P(a);
        }
        static heightfield(t, e, r, n, a) {
            const o = new Me(t, e, r, n, a);
            return new P(o);
        }
        static cylinder(t, e) {
            const r = new De(t, e);
            return new P(r);
        }
        static roundCylinder(t, e, r) {
            const n = new He(t, e, r);
            return new P(n);
        }
        static cone(t, e) {
            const r = new ke(t, e);
            return new P(r);
        }
        static roundCone(t, e, r) {
            const n = new Le(t, e, r);
            return new P(n);
        }
        static convexHull(t) {
            const e = new Ct(t, null);
            return new P(e);
        }
        static convexMesh(t, e) {
            const r = new Ct(t, e);
            return new P(r);
        }
        static roundConvexHull(t, e) {
            const r = new It(t, null, e);
            return new P(r);
        }
        static roundConvexMesh(t, e, r) {
            const n = new It(t, e, r);
            return new P(n);
        }
        setTranslation(t, e, r) {
            if (typeof t != "number" || typeof e != "number" || typeof r != "number") throw TypeError("The translation components must be numbers.");
            return this.translation = {
                x: t,
                y: e,
                z: r
            }, this;
        }
        setRotation(t) {
            return y.copy(this.rotation, t), this;
        }
        setSensor(t) {
            return this.isSensor = t, this;
        }
        setEnabled(t) {
            return this.enabled = t, this;
        }
        setContactSkin(t) {
            return this.contactSkin = t, this;
        }
        setDensity(t) {
            return this.massPropsMode = tt.Density, this.density = t, this;
        }
        setMass(t) {
            return this.massPropsMode = tt.Mass, this.mass = t, this;
        }
        setMassProperties(t, e, r, n) {
            return this.massPropsMode = tt.MassProps, this.mass = t, c.copy(this.centerOfMass, e), c.copy(this.principalAngularInertia, r), y.copy(this.angularInertiaLocalFrame, n), this;
        }
        setRestitution(t) {
            return this.restitution = t, this;
        }
        setFriction(t) {
            return this.friction = t, this;
        }
        setFrictionCombineRule(t) {
            return this.frictionCombineRule = t, this;
        }
        setRestitutionCombineRule(t) {
            return this.restitutionCombineRule = t, this;
        }
        setCollisionGroups(t) {
            return this.collisionGroups = t, this;
        }
        setSolverGroups(t) {
            return this.solverGroups = t, this;
        }
        setActiveHooks(t) {
            return this.activeHooks = t, this;
        }
        setActiveEvents(t) {
            return this.activeEvents = t, this;
        }
        setActiveCollisionTypes(t) {
            return this.activeCollisionTypes = t, this;
        }
        setContactForceEventThreshold(t) {
            return this.contactForceEventThreshold = t, this;
        }
    };
    Yr = class {
        free() {
            this.raw && this.raw.free(), this.raw = void 0, this.map && this.map.clear(), this.map = void 0;
        }
        constructor(t){
            this.raw = t || new A, this.map = new Dt, t && t.forEachColliderHandle((e)=>{
                this.map.set(e, new pe(this, e, null));
            });
        }
        castClosure(t) {
            return (e)=>{
                if (t) return t(this.get(e));
            };
        }
        finalizeDeserialization(t) {
            this.map.forEach((e)=>e.finalizeDeserialization(t));
        }
        createCollider(t, e, r) {
            let n = r != null && r != null;
            if (n && isNaN(r)) throw Error("Cannot create a collider with a parent rigid-body handle that is not a number.");
            let a = e.shape.intoRaw(), o = c.intoRaw(e.translation), w = y.intoRaw(e.rotation), h = c.intoRaw(e.centerOfMass), d = c.intoRaw(e.principalAngularInertia), p = y.intoRaw(e.angularInertiaLocalFrame), u = this.raw.createCollider(e.enabled, a, o, w, e.massPropsMode, e.mass, h, d, p, e.density, e.friction, e.restitution, e.frictionCombineRule, e.restitutionCombineRule, e.isSensor, e.collisionGroups, e.solverGroups, e.activeCollisionTypes, e.activeHooks, e.activeEvents, e.contactForceEventThreshold, e.contactSkin, n, n ? r : 0, t.raw);
            a.free(), o.free(), w.free(), h.free(), d.free(), p.free();
            let g = n ? t.get(r) : null, m = new pe(this, u, g, e.shape);
            return this.map.set(u, m), m;
        }
        remove(t, e, r, n) {
            this.raw.remove(t, e.raw, r.raw, n), this.unmap(t);
        }
        unmap(t) {
            this.map.delete(t);
        }
        get(t) {
            return this.map.get(t);
        }
        len() {
            return this.map.len();
        }
        contains(t) {
            return this.get(t) != null;
        }
        forEach(t) {
            this.map.forEach(t);
        }
        getAll() {
            return this.map.getAll();
        }
    };
    Ad = function() {
        return ii();
    };
    Pd = function(s) {
        ni(s);
    };
    Fd = Object.freeze(Object.defineProperty({
        __proto__: null,
        get ActiveCollisionTypes () {
            return At;
        },
        get ActiveEvents () {
            return xt;
        },
        get ActiveHooks () {
            return Et;
        },
        Ball: Ce,
        BroadPhase: kr,
        CCDSolver: Dr,
        Capsule: Ee,
        CharacterCollision: Vr,
        get CoefficientCombineRule () {
            return wt;
        },
        Collider: pe,
        ColliderDesc: P,
        ColliderSet: Yr,
        ColliderShapeCastHit: gt,
        Cone: ke,
        ConvexPolyhedron: Ct,
        Cuboid: Ie,
        Cylinder: De,
        DebugRenderBuffers: Br,
        DebugRenderPipeline: qr,
        DynamicRayCastVehicleController: Jr,
        EventQueue: Ed,
        get FeatureType () {
            return st;
        },
        FixedImpulseJoint: Rr,
        FixedMultibodyJoint: jr,
        GenericImpulseJoint: Er,
        HalfSpace: Wr,
        get HeightFieldFlags () {
            return _e;
        },
        Heightfield: Me,
        ImpulseJoint: q,
        ImpulseJointSet: Pr,
        IntegrationParameters: Sr,
        IslandManager: Hr,
        get JointAxesMask () {
            return oe;
        },
        JointData: U,
        get JointType () {
            return H;
        },
        KinematicCharacterController: Ur,
        get MassPropsMode () {
            return tt;
        },
        get MotorModel () {
            return ae;
        },
        MultibodyJoint: $,
        MultibodyJointSet: Mr,
        NarrowPhase: Lr,
        PhysicsPipeline: Gr,
        get PidAxesMask () {
            return he;
        },
        PidController: Xr,
        PointColliderProjection: ht,
        PointProjection: pt,
        Polyline: Fe,
        PrismaticImpulseJoint: Ir,
        PrismaticMultibodyJoint: Fr,
        Quaternion: ie,
        get QueryFilterFlags () {
            return ce;
        },
        QueryPipeline: Or,
        Ray: xd,
        RayColliderHit: Ht,
        RayColliderIntersection: dt,
        RayIntersection: ut,
        RevoluteImpulseJoint: xr,
        RevoluteMultibodyJoint: zr,
        RigidBody: se,
        RigidBodyDesc: V,
        RigidBodySet: yr,
        get RigidBodyType () {
            return O;
        },
        RopeImpulseJoint: vr,
        RotationOps: y,
        RoundCone: Le,
        RoundConvexPolyhedron: It,
        RoundCuboid: xe,
        RoundCylinder: He,
        RoundTriangle: je,
        SdpMatrix3: mr,
        SdpMatrix3Ops: ne,
        Segment: Ae,
        SerializationPipeline: we,
        Shape: T,
        ShapeCastHit: at,
        ShapeContact: nt,
        get ShapeType () {
            return j;
        },
        get SolverFlags () {
            return de;
        },
        SphericalImpulseJoint: Ar,
        SphericalMultibodyJoint: Tr,
        SpringImpulseJoint: Cr,
        TempContactForceEvent: Kr,
        TempContactManifold: Nr,
        TriMesh: Te,
        get TriMeshFlags () {
            return le;
        },
        Triangle: Pe,
        UnitImpulseJoint: Re,
        UnitMultibodyJoint: ve,
        Vector3: fr,
        VectorOps: c,
        Voxels: ze,
        World: kt,
        reserveMemory: Pd,
        version: Ad
    }, Symbol.toStringTag, {
        value: "Module"
    }));
});
export { At as ActiveCollisionTypes, xt as ActiveEvents, Et as ActiveHooks, Ce as Ball, kr as BroadPhase, Dr as CCDSolver, Ee as Capsule, Vr as CharacterCollision, wt as CoefficientCombineRule, pe as Collider, P as ColliderDesc, Yr as ColliderSet, gt as ColliderShapeCastHit, ke as Cone, Ct as ConvexPolyhedron, Ie as Cuboid, De as Cylinder, Br as DebugRenderBuffers, qr as DebugRenderPipeline, Jr as DynamicRayCastVehicleController, Ed as EventQueue, st as FeatureType, Rr as FixedImpulseJoint, jr as FixedMultibodyJoint, Er as GenericImpulseJoint, Wr as HalfSpace, _e as HeightFieldFlags, Me as Heightfield, q as ImpulseJoint, Pr as ImpulseJointSet, Sr as IntegrationParameters, Hr as IslandManager, oe as JointAxesMask, U as JointData, H as JointType, Ur as KinematicCharacterController, tt as MassPropsMode, ae as MotorModel, $ as MultibodyJoint, Mr as MultibodyJointSet, Lr as NarrowPhase, Gr as PhysicsPipeline, he as PidAxesMask, Xr as PidController, ht as PointColliderProjection, pt as PointProjection, Fe as Polyline, Ir as PrismaticImpulseJoint, Fr as PrismaticMultibodyJoint, ie as Quaternion, ce as QueryFilterFlags, Or as QueryPipeline, xd as Ray, Ht as RayColliderHit, dt as RayColliderIntersection, ut as RayIntersection, xr as RevoluteImpulseJoint, zr as RevoluteMultibodyJoint, se as RigidBody, V as RigidBodyDesc, yr as RigidBodySet, O as RigidBodyType, vr as RopeImpulseJoint, y as RotationOps, Le as RoundCone, It as RoundConvexPolyhedron, xe as RoundCuboid, He as RoundCylinder, je as RoundTriangle, mr as SdpMatrix3, ne as SdpMatrix3Ops, Ae as Segment, we as SerializationPipeline, T as Shape, at as ShapeCastHit, nt as ShapeContact, j as ShapeType, de as SolverFlags, Ar as SphericalImpulseJoint, Tr as SphericalMultibodyJoint, Cr as SpringImpulseJoint, Kr as TempContactForceEvent, Nr as TempContactManifold, Te as TriMesh, le as TriMeshFlags, Pe as Triangle, Re as UnitImpulseJoint, ve as UnitMultibodyJoint, fr as Vector3, c as VectorOps, ze as Voxels, kt as World, Fd as default, Pd as reserveMemory, Ad as version, __tla };
