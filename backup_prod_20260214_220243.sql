--
-- PostgreSQL database dump
--

\restrict nkyXdODKVt69T6yDl7vYE1xBu6k1FyNeLSBUGCbJjJwflW7Wyg2k5gddyKzvh0X

-- Dumped from database version 16.11
-- Dumped by pg_dump version 16.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: PracticeStatus; Type: TYPE; Schema: public; Owner: mixtape
--

CREATE TYPE public."PracticeStatus" AS ENUM (
    'NOT_STARTED',
    'LEARNING',
    'CONFIDENT'
);


ALTER TYPE public."PracticeStatus" OWNER TO mixtape;

--
-- Name: ReadinessStatus; Type: TYPE; Schema: public; Owner: mixtape
--

CREATE TYPE public."ReadinessStatus" AS ENUM (
    'SOLID',
    'NEEDS_WORK',
    'NOT_READY'
);


ALTER TYPE public."ReadinessStatus" OWNER TO mixtape;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Account; Type: TABLE; Schema: public; Owner: mixtape
--

CREATE TABLE public."Account" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


ALTER TABLE public."Account" OWNER TO mixtape;

--
-- Name: BattlePairingHistory; Type: TABLE; Schema: public; Owner: mixtape
--

CREATE TABLE public."BattlePairingHistory" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "songAId" integer NOT NULL,
    "songBId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."BattlePairingHistory" OWNER TO mixtape;

--
-- Name: BattleSkip; Type: TABLE; Schema: public; Owner: mixtape
--

CREATE TABLE public."BattleSkip" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "songId" integer NOT NULL,
    "lastSkippedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."BattleSkip" OWNER TO mixtape;

--
-- Name: BattleVote; Type: TABLE; Schema: public; Owner: mixtape
--

CREATE TABLE public."BattleVote" (
    id integer NOT NULL,
    "songA" integer NOT NULL,
    "songB" integer NOT NULL,
    winner integer,
    "createdAt" timestamp(3) without time zone DEFAULT now() NOT NULL,
    "userId" text
);


ALTER TABLE public."BattleVote" OWNER TO mixtape;

--
-- Name: BattleVote_id_seq; Type: SEQUENCE; Schema: public; Owner: mixtape
--

CREATE SEQUENCE public."BattleVote_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."BattleVote_id_seq" OWNER TO mixtape;

--
-- Name: BattleVote_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mixtape
--

ALTER SEQUENCE public."BattleVote_id_seq" OWNED BY public."BattleVote".id;


--
-- Name: Comment; Type: TABLE; Schema: public; Owner: mixtape
--

CREATE TABLE public."Comment" (
    id integer NOT NULL,
    content text NOT NULL,
    "songId" integer NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Comment" OWNER TO mixtape;

--
-- Name: Comment_id_seq; Type: SEQUENCE; Schema: public; Owner: mixtape
--

CREATE SEQUENCE public."Comment_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Comment_id_seq" OWNER TO mixtape;

--
-- Name: Comment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mixtape
--

ALTER SEQUENCE public."Comment_id_seq" OWNED BY public."Comment".id;


--
-- Name: Invite; Type: TABLE; Schema: public; Owner: mixtape
--

CREATE TABLE public."Invite" (
    id text NOT NULL,
    email text NOT NULL,
    token text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "usedAt" timestamp(3) without time zone,
    "invitedById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Invite" OWNER TO mixtape;

--
-- Name: PasswordReset; Type: TABLE; Schema: public; Owner: mixtape
--

CREATE TABLE public."PasswordReset" (
    id text NOT NULL,
    email text NOT NULL,
    token text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "usedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PasswordReset" OWNER TO mixtape;

--
-- Name: PracticeListItem; Type: TABLE; Schema: public; Owner: mixtape
--

CREATE TABLE public."PracticeListItem" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "songId" integer NOT NULL,
    status public."PracticeStatus" DEFAULT 'NOT_STARTED'::public."PracticeStatus" NOT NULL,
    priority integer DEFAULT 3 NOT NULL,
    notes text,
    "addedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PracticeListItem" OWNER TO mixtape;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: mixtape
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Session" OWNER TO mixtape;

--
-- Name: Song; Type: TABLE; Schema: public; Owner: mixtape
--

CREATE TABLE public."Song" (
    id integer NOT NULL,
    title text NOT NULL,
    artist text NOT NULL,
    elo double precision DEFAULT 1500 NOT NULL,
    album text,
    "releaseDate" integer,
    spotify text,
    apple text,
    youtube text,
    bandcamp text,
    soundcloud text,
    lyrics text,
    songsterr text,
    "ultimateGuitar" text,
    "createdAt" timestamp(3) without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    decade integer,
    "energyMood" text,
    genre text,
    "albumArtUrl" text,
    "durationMs" integer,
    "keyNotes" text,
    "lastPracticedAt" timestamp(3) without time zone,
    "tuningNotes" text
);


ALTER TABLE public."Song" OWNER TO mixtape;

--
-- Name: SongReadiness; Type: TABLE; Schema: public; Owner: mixtape
--

CREATE TABLE public."SongReadiness" (
    id integer NOT NULL,
    "songId" integer NOT NULL,
    "userId" text NOT NULL,
    status public."ReadinessStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SongReadiness" OWNER TO mixtape;

--
-- Name: SongReadiness_id_seq; Type: SEQUENCE; Schema: public; Owner: mixtape
--

CREATE SEQUENCE public."SongReadiness_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."SongReadiness_id_seq" OWNER TO mixtape;

--
-- Name: SongReadiness_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mixtape
--

ALTER SEQUENCE public."SongReadiness_id_seq" OWNED BY public."SongReadiness".id;


--
-- Name: Song_id_seq; Type: SEQUENCE; Schema: public; Owner: mixtape
--

CREATE SEQUENCE public."Song_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Song_id_seq" OWNER TO mixtape;

--
-- Name: Song_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mixtape
--

ALTER SEQUENCE public."Song_id_seq" OWNED BY public."Song".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: mixtape
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text,
    email text,
    password text,
    "emailVerified" timestamp(3) without time zone,
    image text,
    "isAdmin" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."User" OWNER TO mixtape;

--
-- Name: UserPreference; Type: TABLE; Schema: public; Owner: mixtape
--

CREATE TABLE public."UserPreference" (
    id text NOT NULL,
    "userId" text NOT NULL,
    genres text[] DEFAULT ARRAY[]::text[],
    decades integer[] DEFAULT ARRAY[]::integer[],
    artists text[] DEFAULT ARRAY[]::text[],
    "energyMoods" text[] DEFAULT ARRAY[]::text[],
    "excludedSongIds" integer[] DEFAULT ARRAY[]::integer[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."UserPreference" OWNER TO mixtape;

--
-- Name: VerificationToken; Type: TABLE; Schema: public; Owner: mixtape
--

CREATE TABLE public."VerificationToken" (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."VerificationToken" OWNER TO mixtape;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: mixtape
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO mixtape;

--
-- Name: BattleVote id; Type: DEFAULT; Schema: public; Owner: mixtape
--

ALTER TABLE ONLY public."BattleVote" ALTER COLUMN id SET DEFAULT nextval('public."BattleVote_id_seq"'::regclass);


--
-- Name: Comment id; Type: DEFAULT; Schema: public; Owner: mixtape
--

ALTER TABLE ONLY public."Comment" ALTER COLUMN id SET DEFAULT nextval('public."Comment_id_seq"'::regclass);


--
-- Name: Song id; Type: DEFAULT; Schema: public; Owner: mixtape
--

ALTER TABLE ONLY public."Song" ALTER COLUMN id SET DEFAULT nextval('public."Song_id_seq"'::regclass);


--
-- Name: SongReadiness id; Type: DEFAULT; Schema: public; Owner: mixtape
--

ALTER TABLE ONLY public."SongReadiness" ALTER COLUMN id SET DEFAULT nextval('public."SongReadiness_id_seq"'::regclass);


--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: mixtape
--

COPY public."Account" (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
\.


--
-- Data for Name: BattlePairingHistory; Type: TABLE DATA; Schema: public; Owner: mixtape
--

COPY public."BattlePairingHistory" (id, "userId", "songAId", "songBId", "createdAt") FROM stdin;
cmlbe2ths0001o801ntuim5f9	cml8zmoj10000lq01dsv92r8r	7	22	2026-02-06 21:20:13.264
cmlbe2v3p0003o8018h0f69ti	cml8zmoj10000lq01dsv92r8r	7	27	2026-02-06 21:20:15.349
cmlbe2wpd0009o80100nlgtc4	cml8zmoj10000lq01dsv92r8r	16	26	2026-02-06 21:20:17.426
cmlbe2ypm000bo801jj171e6h	cml8zmoj10000lq01dsv92r8r	14	24	2026-02-06 21:20:20.027
cmlbqfxxy0001n001l54ucri6	cml8zmoj10000lq01dsv92r8r	33	60	2026-02-07 03:06:20.951
cmlcgfu5f0002n001345grgvy	cml9xqamk0000p501dc0idtmt	63	102	2026-02-07 15:14:06.051
cmlcgfzpk0004n001262ntj4k	cml9xqamk0000p501dc0idtmt	33	102	2026-02-07 15:14:13.257
cmlcgg3wg0006n0016d1ngwxf	cml9xqamk0000p501dc0idtmt	11	30	2026-02-07 15:14:18.688
cmlcgho9f0008n001sfanru86	cml9xqamk0000p501dc0idtmt	70	81	2026-02-07 15:15:31.732
cmlcghu1d000an001hp1lnie0	cml9xqamk0000p501dc0idtmt	66	83	2026-02-07 15:15:39.217
cmlcgi1uo000cn0019gvfha2w	cml9xqamk0000p501dc0idtmt	94	96	2026-02-07 15:15:49.345
cmlcgi9cq000en001z5ealcus	cml9xqamk0000p501dc0idtmt	1	5	2026-02-07 15:15:59.066
cmlcgieb2000gn001u5m46f8g	cml9xqamk0000p501dc0idtmt	17	97	2026-02-07 15:16:05.486
cmlcgijqu000in00116y80yrt	cml9xqamk0000p501dc0idtmt	9	25	2026-02-07 15:16:12.534
cmlcgirxs000kn0016h7cif50	cml9xqamk0000p501dc0idtmt	89	98	2026-02-07 15:16:23.152
cmlcgj75n000mn00161qnhhgc	cml9xqamk0000p501dc0idtmt	42	84	2026-02-07 15:16:42.875
cmlcgjeq5000on001zoi6la9x	cml9xqamk0000p501dc0idtmt	66	94	2026-02-07 15:16:52.685
cmlcgjspr000qn001y7mvp0ba	cml9xqamk0000p501dc0idtmt	49	86	2026-02-07 15:17:10.815
cmlcgjyjo000sn001lxdpdwkf	cml9xqamk0000p501dc0idtmt	62	87	2026-02-07 15:17:18.372
cmlcgk3ji000un0015ecbvjeq	cml9xqamk0000p501dc0idtmt	82	88	2026-02-07 15:17:24.846
cmlcgkc24000wn001toirkkzn	cml9xqamk0000p501dc0idtmt	6	9	2026-02-07 15:17:35.884
cmlcgllzh000yn001o1kxosud	cml9xqamk0000p501dc0idtmt	10	53	2026-02-07 15:18:35.405
cmlcgltg20010n001gosntewd	cml9xqamk0000p501dc0idtmt	84	96	2026-02-07 15:18:45.074
cmlcglw120012n0015zg2irk1	cml9xqamk0000p501dc0idtmt	4	97	2026-02-07 15:18:48.422
cmlcgm1dr0014n00117nkk9a8	cml9xqamk0000p501dc0idtmt	80	90	2026-02-07 15:18:55.359
cmlcgm7yi0016n001hk313ksu	cml9xqamk0000p501dc0idtmt	88	90	2026-02-07 15:19:03.882
cmlcgmd8z0018n001f5o20xys	cml9xqamk0000p501dc0idtmt	86	87	2026-02-07 15:19:10.739
cmlcgmi7z001an001nvy8lhkc	cml9xqamk0000p501dc0idtmt	9	19	2026-02-07 15:19:17.183
cmlcgmp4g001cn001i5zkpgir	cml9xqamk0000p501dc0idtmt	6	19	2026-02-07 15:19:26.129
cmlcgms9q001en00109ektw2o	cml9xqamk0000p501dc0idtmt	88	94	2026-02-07 15:19:30.206
cmlcgmutc001gn001tovb2zk6	cml9xqamk0000p501dc0idtmt	6	11	2026-02-07 15:19:33.505
cmlcgmz2b001in0015aix1jm5	cml9xqamk0000p501dc0idtmt	15	81	2026-02-07 15:19:39.011
cmlcgnbni001kn001lyus1mn6	cml9xqamk0000p501dc0idtmt	17	70	2026-02-07 15:19:55.326
cmlcgnish001mn001nw1eqvsp	cml9xqamk0000p501dc0idtmt	43	77	2026-02-07 15:20:04.577
cmlcgnsnj001on001kpvr0b0z	cml9xqamk0000p501dc0idtmt	45	61	2026-02-07 15:20:17.359
cmlcgo123001qn0019edwm9x1	cml9xqamk0000p501dc0idtmt	44	68	2026-02-07 15:20:28.251
cmlcgo6t9001sn001rs5yrpx8	cml9xqamk0000p501dc0idtmt	91	100	2026-02-07 15:20:35.709
cmlcgof9l001un0018z0bghwi	cml9xqamk0000p501dc0idtmt	74	92	2026-02-07 15:20:46.666
cmlcgonmp001wn001k02wdudy	cml9xqamk0000p501dc0idtmt	70	86	2026-02-07 15:20:57.506
cmlcgos2l001yn001hzh9w5m8	cml9xqamk0000p501dc0idtmt	16	42	2026-02-07 15:21:03.261
cmlcgow9u0020n001due8kljz	cml9xqamk0000p501dc0idtmt	11	19	2026-02-07 15:21:08.707
cmlcgp1py0022n0019fpap1iy	cml9xqamk0000p501dc0idtmt	12	18	2026-02-07 15:21:15.767
cmlcgpgqs0024n001a0pywxgw	cml9xqamk0000p501dc0idtmt	41	48	2026-02-07 15:21:35.236
cmlcgpmm9002an001eko0x3il	cml9xqamk0000p501dc0idtmt	23	64	2026-02-07 15:21:42.849
cmlcgpt9j002cn001xomphc69	cml9xqamk0000p501dc0idtmt	46	90	2026-02-07 15:21:51.463
cmlcgq91w002en001tt6xwrxp	cml9xqamk0000p501dc0idtmt	7	32	2026-02-07 15:22:11.924
cmlcgqkn0002gn0019ia3hlzd	cml9xqamk0000p501dc0idtmt	21	52	2026-02-07 15:22:26.94
cmlcgqtsr002in001xfzi8plx	cml9xqamk0000p501dc0idtmt	8	14	2026-02-07 15:22:38.811
cmlcgqxmw002kn0015shwcp61	cml9xqamk0000p501dc0idtmt	10	100	2026-02-07 15:22:43.784
cmlcgr4oz002mn001xua8cqyg	cml9xqamk0000p501dc0idtmt	5	6	2026-02-07 15:22:52.931
cmlcgrbsq002on0016mdxrfe4	cml9xqamk0000p501dc0idtmt	43	44	2026-02-07 15:23:02.137
cmlcgrs9a002qn00139pp8mdu	cml9xqamk0000p501dc0idtmt	46	82	2026-02-07 15:23:23.471
cmlcgrzos002sn00124mq709v	cml9xqamk0000p501dc0idtmt	73	101	2026-02-07 15:23:33.1
cmlcgs7hh002un001op3ls048	cml9xqamk0000p501dc0idtmt	7	12	2026-02-07 15:23:43.205
cmlcgsbnw002wn001jtewbuto	cml9xqamk0000p501dc0idtmt	64	74	2026-02-07 15:23:48.62
cmlcgsnol002yn001weo5stvh	cml9xqamk0000p501dc0idtmt	75	99	2026-02-07 15:24:04.198
cmlcgstzc0034n001gjsoxqbk	cml9xqamk0000p501dc0idtmt	14	94	2026-02-07 15:24:12.36
cmlcgsynq0036n001qwsymvod	cml9xqamk0000p501dc0idtmt	62	77	2026-02-07 15:24:18.423
cmlcgt2jx0038n0012yso6uur	cml9xqamk0000p501dc0idtmt	1	3	2026-02-07 15:24:23.469
cmlcgtlr0003an0019pn6sfrp	cml9xqamk0000p501dc0idtmt	27	32	2026-02-07 15:24:48.348
cmlcgtp93003cn001osez0vc9	cml9xqamk0000p501dc0idtmt	14	43	2026-02-07 15:24:52.887
cmlcgtvkq003en001a1eoj4j8	cml9xqamk0000p501dc0idtmt	14	98	2026-02-07 15:25:01.082
cmlcgu40m003gn0017sy81l06	cml9xqamk0000p501dc0idtmt	5	19	2026-02-07 15:25:12.023
cmlcgu928003in001dzo1v5ey	cml9xqamk0000p501dc0idtmt	2	68	2026-02-07 15:25:18.561
cmlcgui4t003kn0011f6x1vyi	cml9xqamk0000p501dc0idtmt	59	62	2026-02-07 15:25:30.317
cmlcguo1y003mn001bbo39ldx	cml9xqamk0000p501dc0idtmt	13	18	2026-02-07 15:25:37.989
cmlcguv11003on001uu3caqx1	cml9xqamk0000p501dc0idtmt	22	32	2026-02-07 15:25:47.029
cmlcgv7lg003qn001rnkondna	cml9xqamk0000p501dc0idtmt	47	51	2026-02-07 15:26:03.316
cmlcgvkwc003sn0019snhu0il	cml9xqamk0000p501dc0idtmt	26	86	2026-02-07 15:26:20.556
cmlcgvpg4003un0010ly2lu0z	cml9xqamk0000p501dc0idtmt	93	100	2026-02-07 15:26:26.452
cmlcgvvez003wn001wl9e9nz9	cml9xqamk0000p501dc0idtmt	66	82	2026-02-07 15:26:34.187
cmlcgvz7x003yn001b42ski77	cml9xqamk0000p501dc0idtmt	44	76	2026-02-07 15:26:39.117
cmlcgw96n0040n001lsqe2d3r	cml9xqamk0000p501dc0idtmt	64	102	2026-02-07 15:26:52.031
cmlcgwdkc0042n001os64v5lk	cml9xqamk0000p501dc0idtmt	44	70	2026-02-07 15:26:57.708
cmlcgwklj0044n001zmwi593s	cml9xqamk0000p501dc0idtmt	66	102	2026-02-07 15:27:06.823
cmlcgwnvm0046n001jasdlzby	cml9xqamk0000p501dc0idtmt	88	100	2026-02-07 15:27:11.074
cmlcwltae0001mi013h9eis1m	cml8zmoj10000lq01dsv92r8r	15	56	2026-02-07 22:46:38.727
cmlcwlxdn0003mi01jpp1dtrs	cml8zmoj10000lq01dsv92r8r	50	57	2026-02-07 22:46:44.027
cmlcwm1cd0005mi01ifw6axsc	cml8zmoj10000lq01dsv92r8r	44	88	2026-02-07 22:46:49.165
cmlcy4pmf000bmi012ggk1h4s	cml8zmoj10000lq01dsv92r8r	7	13	2026-02-07 23:29:20.055
cmld1d6hy000kmi014nyuz64i	cmld1c7ig000imi01uf7ikzgc	18	82	2026-02-08 00:59:54.022
cmld1f184000qmi01ekzdbd22	cmld1c7ig000imi01uf7ikzgc	44	88	2026-02-08 01:01:20.5
cmld1f719000smi01sct4pugq	cmld1c7ig000imi01uf7ikzgc	58	99	2026-02-08 01:01:28.029
cmld1g0jl000umi01nhosycf9	cmld1c7ig000imi01uf7ikzgc	75	85	2026-02-08 01:02:06.273
cmld1g5i8000wmi01lwbnu9yz	cmld1c7ig000imi01uf7ikzgc	5	6	2026-02-08 01:02:12.705
cmld1g9f50012mi01ee4dtrhm	cmld1c7ig000imi01uf7ikzgc	86	94	2026-02-08 01:02:17.777
cmld1gdyr0018mi01rehrvhfp	cmld1c7ig000imi01uf7ikzgc	46	81	2026-02-08 01:02:23.668
cmld1gkmp001emi01kjrhsygv	cmld1c7ig000imi01uf7ikzgc	17	48	2026-02-08 01:02:32.305
cmld1gv5o001kmi01aedwsrxm	cmld1c7ig000imi01uf7ikzgc	83	89	2026-02-08 01:02:45.949
cmld1h0kq001mmi01kw2yigxk	cmld1c7ig000imi01uf7ikzgc	3	25	2026-02-08 01:02:52.97
cmld1htf1001omi01jggau57n	cmld1c7ig000imi01uf7ikzgc	66	74	2026-02-08 01:03:30.349
cmld1i0qv001qmi015ej8g3wf	cmld1c7ig000imi01uf7ikzgc	21	63	2026-02-08 01:03:39.847
cmld1i50q001wmi01gsx94349	cmld1c7ig000imi01uf7ikzgc	20	60	2026-02-08 01:03:45.387
cmld1i8wv0022mi01nxaqqyyl	cmld1c7ig000imi01uf7ikzgc	98	102	2026-02-08 01:03:50.431
cmld1ie7t0024mi01e2azsvyy	cmld1c7ig000imi01uf7ikzgc	32	102	2026-02-08 01:03:57.305
cmld1iicb002ami018hskw5nh	cmld1c7ig000imi01uf7ikzgc	15	66	2026-02-08 01:04:02.65
cmld1in2q002cmi01c1oy4d6q	cmld1c7ig000imi01uf7ikzgc	55	84	2026-02-08 01:04:08.786
cmld1irgj002emi01jgdqnyax	cmld1c7ig000imi01uf7ikzgc	30	77	2026-02-08 01:04:14.467
cmld1ndt9002gmi01l0kj7lbb	cmld1c7ig000imi01uf7ikzgc	24	79	2026-02-08 01:07:50.061
cmld1nhq1002mmi01xl2flq52	cmld1c7ig000imi01uf7ikzgc	98	101	2026-02-08 01:07:55.129
cmld1nnmn002omi017me2qlml	cmld1c7ig000imi01uf7ikzgc	95	100	2026-02-08 01:08:02.783
cmld1nsyu002qmi01sp6fyw9z	cmld1c7ig000imi01uf7ikzgc	83	101	2026-02-08 01:08:09.702
cmld1nyrq002smi01mc0x9pxx	cmld1c7ig000imi01uf7ikzgc	87	97	2026-02-08 01:08:17.222
cmld1o2rn002umi01n91f99jc	cmld1c7ig000imi01uf7ikzgc	80	101	2026-02-08 01:08:22.403
cmld1o7zd002wmi01usgkffbp	cmld1c7ig000imi01uf7ikzgc	26	42	2026-02-08 01:08:29.161
cmld1oci70032mi01jevj0nce	cmld1c7ig000imi01uf7ikzgc	12	27	2026-02-08 01:08:35.023
cmld4fqwk0034mi01u299g3j3	cml8zmoj10000lq01dsv92r8r	68	79	2026-02-08 02:25:52.628
cmle47i290003r401zuj9jsgv	cml8zmoj10000lq01dsv92r8r	42	103	2026-02-08 19:07:14.097
cmle47o4v0005r40126sdnxst	cml8zmoj10000lq01dsv92r8r	7	11	2026-02-08 19:07:21.967
cmle47ud70007r401xresp02p	cml8zmoj10000lq01dsv92r8r	84	104	2026-02-08 19:07:30.043
cmle47zzv0009r4010hga3osy	cml8zmoj10000lq01dsv92r8r	18	46	2026-02-08 19:07:37.34
cmle487gj000br4010tv2ql34	cml8zmoj10000lq01dsv92r8r	14	68	2026-02-08 19:07:47.011
cmle48bdg000hr401svuuvsa5	cml8zmoj10000lq01dsv92r8r	5	16	2026-02-08 19:07:52.084
cmle48hvg000jr401u1g22eag	cml8zmoj10000lq01dsv92r8r	30	87	2026-02-08 19:08:00.509
cmle48p40000lr401iycgvdlb	cml8zmoj10000lq01dsv92r8r	30	42	2026-02-08 19:08:09.889
cmle48wc7000rr40174d6xbsd	cml8zmoj10000lq01dsv92r8r	24	48	2026-02-08 19:08:19.255
cmle49235000tr401mc1hzi5p	cml8zmoj10000lq01dsv92r8r	19	82	2026-02-08 19:08:26.705
cmle496mv000vr401r76y3qe3	cml8zmoj10000lq01dsv92r8r	1	29	2026-02-08 19:08:32.599
cmle49d7t000xr4016vh1hjl0	cml8zmoj10000lq01dsv92r8r	1	5	2026-02-08 19:08:41.129
cmle49lg6000zr401cqkp7s6x	cml8zmoj10000lq01dsv92r8r	29	82	2026-02-08 19:08:51.799
cmle49rml0011r401d2tge98v	cml8zmoj10000lq01dsv92r8r	45	79	2026-02-08 19:08:59.805
cmle49vhz0013r401wg05d6rv	cml8zmoj10000lq01dsv92r8r	41	76	2026-02-08 19:09:04.824
cmle4a1430015r401im7z72ly	cml8zmoj10000lq01dsv92r8r	5	24	2026-02-08 19:09:12.099
cmle4a5qy0017r401fbrj3lat	cml8zmoj10000lq01dsv92r8r	46	76	2026-02-08 19:09:18.107
cmle4act10019r401rgiwo2rz	cml8zmoj10000lq01dsv92r8r	71	97	2026-02-08 19:09:27.253
cmle4amq5001br40164nt3am2	cml8zmoj10000lq01dsv92r8r	69	76	2026-02-08 19:09:40.109
cmle4ds6b001dr401m9pveft1	cml8zmoj10000lq01dsv92r8r	45	69	2026-02-08 19:12:07.139
cmle4dwns001fr40134pagjic	cml8zmoj10000lq01dsv92r8r	8	52	2026-02-08 19:12:12.952
cmle4g7hn001hr401o9zchalr	cml8zmoj10000lq01dsv92r8r	7	71	2026-02-08 19:14:00.299
cmle4gcz5001jr4011t4k7u4b	cml8zmoj10000lq01dsv92r8r	27	57	2026-02-08 19:14:07.409
cmle4gh6g001lr401oe37dgmn	cml8zmoj10000lq01dsv92r8r	23	90	2026-02-08 19:14:12.856
cmle4gqqr001nr401szesldcz	cml8zmoj10000lq01dsv92r8r	5	18	2026-02-08 19:14:25.251
cmle4gx7y001pr401474nlhy5	cml8zmoj10000lq01dsv92r8r	25	56	2026-02-08 19:14:33.646
cmleghfwm001rr401fqh707ej	cml8zmoj10000lq01dsv92r8r	10	22	2026-02-09 00:50:53.254
cmleghkwf001tr401exahnsqv	cml8zmoj10000lq01dsv92r8r	3	29	2026-02-09 00:50:59.726
cmleghu89001vr401001q7udh	cml8zmoj10000lq01dsv92r8r	8	16	2026-02-09 00:51:11.817
cmlegi1qo001xr401g97s22rl	cml8zmoj10000lq01dsv92r8r	4	44	2026-02-09 00:51:21.552
cmlfcmyt10001sa01ax1cvmy0	cml9xqamk0000p501dc0idtmt	9	66	2026-02-09 15:50:58.741
cmlfcn1mb0003sa018l9q58zw	cml9xqamk0000p501dc0idtmt	8	29	2026-02-09 15:51:02.387
cmlfcn7rp0005sa0112ckcl0j	cml9xqamk0000p501dc0idtmt	69	105	2026-02-09 15:51:10.357
cmlfcnb7p0007sa018ldxtgqg	cml9xqamk0000p501dc0idtmt	64	67	2026-02-09 15:51:14.821
cmlfcnh450009sa01seprvivv	cml9xqamk0000p501dc0idtmt	2	71	2026-02-09 15:51:22.469
cmlfcnjck000bsa01hn1bml8o	cml9xqamk0000p501dc0idtmt	60	66	2026-02-09 15:51:25.365
cmlfcnp38000dsa0151kdl7xg	cml9xqamk0000p501dc0idtmt	65	67	2026-02-09 15:51:32.804
cmlfcnrwv000fsa01zmd9z2ya	cml9xqamk0000p501dc0idtmt	28	61	2026-02-09 15:51:36.463
cmlfcntqz000hsa01n8yrhbev	cml9xqamk0000p501dc0idtmt	26	97	2026-02-09 15:51:38.844
cmlfcnzpk000jsa01ohrq3339	cml9xqamk0000p501dc0idtmt	30	67	2026-02-09 15:51:46.568
cmlfcp1vw000lsa019im0yta5	cml9xqamk0000p501dc0idtmt	8	91	2026-02-09 15:52:36.042
cmlfcp5l3000nsa019z2kl4cj	cml9xqamk0000p501dc0idtmt	10	23	2026-02-09 15:52:40.839
cmlfcp7v5000psa01kk6lma3m	cml9xqamk0000p501dc0idtmt	14	101	2026-02-09 15:52:43.793
cmlfcp9vc000rsa01gv0e0tk3	cml9xqamk0000p501dc0idtmt	49	99	2026-02-09 15:52:46.392
cmlfcpd09000tsa01f1z11bzp	cml9xqamk0000p501dc0idtmt	18	57	2026-02-09 15:52:50.457
cmlfcpfdq000vsa01a2eas228	cml9xqamk0000p501dc0idtmt	9	46	2026-02-09 15:52:53.535
cmlfcphb4000xsa01pvbrr5y1	cml9xqamk0000p501dc0idtmt	7	102	2026-02-09 15:52:56.032
cmlfcpknw000zsa010v4vwnk8	cml9xqamk0000p501dc0idtmt	48	101	2026-02-09 15:53:00.379
cmlfcpnwg0011sa01rxhbhc4y	cml9xqamk0000p501dc0idtmt	8	17	2026-02-09 15:53:04.576
cmlfcpsbk0013sa01kq5mnp9n	cml9xqamk0000p501dc0idtmt	14	30	2026-02-09 15:53:10.304
cmlfcpv900015sa01lha79fwh	cml9xqamk0000p501dc0idtmt	22	33	2026-02-09 15:53:14.1
cmlfcpx520017sa010j4ie08j	cml9xqamk0000p501dc0idtmt	20	28	2026-02-09 15:53:16.55
cmlfcpzpa0019sa011l6b9btu	cml9xqamk0000p501dc0idtmt	20	98	2026-02-09 15:53:19.87
cmlfcq37h001bsa01hzvcqjjq	cml9xqamk0000p501dc0idtmt	58	67	2026-02-09 15:53:24.413
cmlfcq7i9001fsa01od1bkx5x	cml9xqamk0000p501dc0idtmt	61	104	2026-02-09 15:53:29.985
cmlfcqfak001lsa01a3uvfhmi	cml9xqamk0000p501dc0idtmt	6	25	2026-02-09 15:53:40.077
cmlfcqlj3001psa01q77pa2yh	cml9xqamk0000p501dc0idtmt	63	100	2026-02-09 15:53:48.159
cmlfcqxgf001tsa01zyrwwvi5	cml9xqamk0000p501dc0idtmt	50	91	2026-02-09 15:54:03.615
cmlfcr40i001xsa01ope0b0wo	cml9xqamk0000p501dc0idtmt	46	69	2026-02-09 15:54:12.114
cmlfcrbzd0023sa01t2bla31a	cml9xqamk0000p501dc0idtmt	18	28	2026-02-09 15:54:22.441
cmlfcrfux0027sa01ajds0rp6	cml9xqamk0000p501dc0idtmt	69	78	2026-02-09 15:54:27.465
cmlfcrkci002bsa01n4sde8w7	cml9xqamk0000p501dc0idtmt	18	77	2026-02-09 15:54:33.282
cmlfcrpa8002fsa01dp21p7f6	cml9xqamk0000p501dc0idtmt	25	50	2026-02-09 15:54:39.68
cmlfcs1i2002jsa01h1f5tgfw	cml9xqamk0000p501dc0idtmt	52	79	2026-02-09 15:54:55.515
cmlfcsaiv002nsa01pkkbn8uk	cml9xqamk0000p501dc0idtmt	16	99	2026-02-09 15:55:07.207
cmlfcsfiu002rsa01d08l3u4a	cml9xqamk0000p501dc0idtmt	52	57	2026-02-09 15:55:13.686
cmlfcska6002vsa01bbccv90k	cml9xqamk0000p501dc0idtmt	68	83	2026-02-09 15:55:19.854
cmlfcq5g4001dsa01jag22cz0	cml9xqamk0000p501dc0idtmt	52	90	2026-02-09 15:53:27.316
cmlfcqa40001hsa01ik0i6u6e	cml9xqamk0000p501dc0idtmt	2	105	2026-02-09 15:53:33.36
cmlfcqd62001jsa01sx9wg0hm	cml9xqamk0000p501dc0idtmt	31	99	2026-02-09 15:53:37.322
cmlfcqirq001nsa01aefzxgu6	cml9xqamk0000p501dc0idtmt	27	60	2026-02-09 15:53:44.582
cmlfcqqa2001rsa01bj7giw5g	cml9xqamk0000p501dc0idtmt	60	92	2026-02-09 15:53:54.314
cmlfcr0jg001vsa016zrllnl9	cml9xqamk0000p501dc0idtmt	18	102	2026-02-09 15:54:07.612
cmlfcr60v001zsa01mu9qtvgb	cml9xqamk0000p501dc0idtmt	16	73	2026-02-09 15:54:14.718
cmlfcr8of0021sa01ltpam3u6	cml9xqamk0000p501dc0idtmt	42	88	2026-02-09 15:54:18.16
cmlfcrdni0025sa0179o2s0ii	cml9xqamk0000p501dc0idtmt	4	55	2026-02-09 15:54:24.607
cmlfcri300029sa011s7q9f2q	cml9xqamk0000p501dc0idtmt	78	104	2026-02-09 15:54:30.348
cmlfcrmh1002dsa01wn3b57c9	cml9xqamk0000p501dc0idtmt	69	103	2026-02-09 15:54:36.038
cmlfcrrpj002hsa01s160mhdv	cml9xqamk0000p501dc0idtmt	76	97	2026-02-09 15:54:42.823
cmlfcs7pt002lsa01prfco77i	cml9xqamk0000p501dc0idtmt	13	28	2026-02-09 15:55:03.569
cmlfcsd3i002psa01y2bwag2c	cml9xqamk0000p501dc0idtmt	14	60	2026-02-09 15:55:10.543
cmlfcshdj002tsa01bz8zkaj2	cml9xqamk0000p501dc0idtmt	43	80	2026-02-09 15:55:16.087
cmlfcsmh1002xsa01qk1f0faa	cml9xqamk0000p501dc0idtmt	28	41	2026-02-09 15:55:22.693
cmlfcsq9s002zsa011aqhei2j	cml9xqamk0000p501dc0idtmt	60	78	2026-02-09 15:55:27.617
cmlfcstlv0031sa01qmqk2xz4	cml9xqamk0000p501dc0idtmt	44	98	2026-02-09 15:55:31.939
cmlfcswkm0033sa010ajlvwu5	cml9xqamk0000p501dc0idtmt	8	9	2026-02-09 15:55:35.782
cmlfct0sb0035sa01cqlvwq2k	cml9xqamk0000p501dc0idtmt	2	42	2026-02-09 15:55:41.244
cmlfzafsn0001pr01b19hp97f	cml8zmoj10000lq01dsv92r8r	71	75	2026-02-10 02:25:05.399
cmlfzami20003pr01x6tu1u64	cml8zmoj10000lq01dsv92r8r	8	44	2026-02-10 02:25:14.091
cmlfzayeu0005pr01z86g5c69	cml8zmoj10000lq01dsv92r8r	8	81	2026-02-10 02:25:29.527
cmlfzb2d30007pr012ym5vf5g	cml8zmoj10000lq01dsv92r8r	53	92	2026-02-10 02:25:34.647
cmlfzb61d0009pr01dq8ot5sf	cml8zmoj10000lq01dsv92r8r	45	91	2026-02-10 02:25:39.41
cmllljdz40001mg01amqgnr8m	cml8zmoj10000lq01dsv92r8r	10	95	2026-02-14 00:46:45.376
cmllljn5p0003mg0126ij4303	cml8zmoj10000lq01dsv92r8r	28	59	2026-02-14 00:46:57.278
cmllljsol0005mg01bl56v7xt	cml8zmoj10000lq01dsv92r8r	23	62	2026-02-14 00:47:04.437
\.


--
-- Data for Name: BattleSkip; Type: TABLE DATA; Schema: public; Owner: mixtape
--

COPY public."BattleSkip" (id, "userId", "songId", "lastSkippedAt") FROM stdin;
cmlbe2v3p0005o8018obv54b4	cml8zmoj10000lq01dsv92r8r	27	2026-02-06 21:20:15.349
cmlbe2v3p0007o801jxw4damx	cml8zmoj10000lq01dsv92r8r	7	2026-02-06 21:20:15.349
cmlcgpgqs0026n0011aj95edt	cml9xqamk0000p501dc0idtmt	48	2026-02-07 15:21:35.236
cmlcgpgqs0028n001yvfpzmj0	cml9xqamk0000p501dc0idtmt	41	2026-02-07 15:21:35.236
cmlcgsnom0030n0019mvml5jy	cml9xqamk0000p501dc0idtmt	99	2026-02-07 15:24:04.198
cmlcgsnom0032n001oazc1nqq	cml9xqamk0000p501dc0idtmt	75	2026-02-07 15:24:04.198
cmlcwm1cd0007mi01714sh3vl	cml8zmoj10000lq01dsv92r8r	88	2026-02-07 22:46:49.165
cmlcwm1cd0009mi01kyhglxrr	cml8zmoj10000lq01dsv92r8r	44	2026-02-07 22:46:49.165
cmld1d6hy000mmi015uog4lsn	cmld1c7ig000imi01uf7ikzgc	18	2026-02-08 00:59:54.022
cmld1d6hy000omi0161je9b3p	cmld1c7ig000imi01uf7ikzgc	82	2026-02-08 00:59:54.022
cmld1g5i8000ymi01sipfvjgt	cmld1c7ig000imi01uf7ikzgc	6	2026-02-08 01:02:12.705
cmld1g5i90010mi014y8s6o06	cmld1c7ig000imi01uf7ikzgc	5	2026-02-08 01:02:12.705
cmld1g9f50014mi01qlimdtrr	cmld1c7ig000imi01uf7ikzgc	86	2026-02-08 01:02:17.777
cmld1g9f50016mi01x9cmlkl9	cmld1c7ig000imi01uf7ikzgc	94	2026-02-08 01:02:17.777
cmld1gdyr001ami01evir5yws	cmld1c7ig000imi01uf7ikzgc	46	2026-02-08 01:02:23.668
cmld1gdyr001cmi01eoulg72l	cmld1c7ig000imi01uf7ikzgc	81	2026-02-08 01:02:23.668
cmld1gkmp001gmi01k4j8nyjf	cmld1c7ig000imi01uf7ikzgc	48	2026-02-08 01:02:32.305
cmld1gkmp001imi01sqlfhlye	cmld1c7ig000imi01uf7ikzgc	17	2026-02-08 01:02:32.305
cmld1i0qv001smi01rglog1e8	cmld1c7ig000imi01uf7ikzgc	21	2026-02-08 01:03:39.847
cmld1i0qv001umi012701051x	cmld1c7ig000imi01uf7ikzgc	63	2026-02-08 01:03:39.847
cmld1i50q001ymi011zpd9l2f	cmld1c7ig000imi01uf7ikzgc	20	2026-02-08 01:03:45.387
cmld1i50r0020mi01bmqufqft	cmld1c7ig000imi01uf7ikzgc	60	2026-02-08 01:03:45.387
cmld1ie7t0026mi01miexdhwi	cmld1c7ig000imi01uf7ikzgc	32	2026-02-08 01:03:57.305
cmld1ie7t0028mi01pj39ssi9	cmld1c7ig000imi01uf7ikzgc	102	2026-02-08 01:03:57.305
cmld1ndt9002imi010bnyw264	cmld1c7ig000imi01uf7ikzgc	79	2026-02-08 01:07:50.061
cmld1ndt9002kmi01q63kggiu	cmld1c7ig000imi01uf7ikzgc	24	2026-02-08 01:07:50.061
cmld1o7zd002ymi01v2md9chh	cmld1c7ig000imi01uf7ikzgc	42	2026-02-08 01:08:29.161
cmld1o7zd0030mi014jewomcc	cmld1c7ig000imi01uf7ikzgc	26	2026-02-08 01:08:29.161
cmle487gj000dr401kqwzt722	cml8zmoj10000lq01dsv92r8r	14	2026-02-08 19:07:47.011
cmle487gj000fr401iz2od6w7	cml8zmoj10000lq01dsv92r8r	68	2026-02-08 19:07:47.011
cmle48p40000nr401p386g4nb	cml8zmoj10000lq01dsv92r8r	30	2026-02-08 19:08:09.889
cmle48p40000pr40184whtqnu	cml8zmoj10000lq01dsv92r8r	42	2026-02-08 19:08:09.889
\.


--
-- Data for Name: BattleVote; Type: TABLE DATA; Schema: public; Owner: mixtape
--

COPY public."BattleVote" (id, "songA", "songB", winner, "createdAt", "userId") FROM stdin;
1	7	13	7	2026-02-05 05:26:24.013	\N
2	15	11	15	2026-02-05 20:55:39.289	\N
3	18	21	18	2026-02-05 20:55:43.727	\N
4	21	32	21	2026-02-05 20:55:50.779	\N
5	6	1	6	2026-02-05 20:55:54.018	\N
6	2	7	2	2026-02-05 20:55:58.264	\N
7	17	26	17	2026-02-05 20:56:01.621	\N
8	19	20	19	2026-02-05 20:56:07.48	\N
9	33	32	33	2026-02-05 20:56:10.876	\N
10	24	21	24	2026-02-05 20:56:16.942	\N
11	16	27	16	2026-02-05 20:56:20.497	\N
12	16	5	16	2026-02-05 20:56:24.834	\N
13	19	24	19	2026-02-05 20:56:28.57	\N
14	19	2	19	2026-02-05 20:56:31.841	\N
15	31	29	31	2026-02-05 20:56:35.056	\N
16	26	27	26	2026-02-05 20:56:37.976	\N
17	33	21	33	2026-02-05 20:56:40.2	\N
18	9	25	9	2026-02-05 20:56:43.471	\N
19	9	15	9	2026-02-05 20:56:46.917	\N
20	21	29	21	2026-02-05 20:56:49.678	\N
21	13	20	13	2026-02-05 20:56:52.336	\N
22	13	7	13	2026-02-05 20:56:55.733	\N
23	30	11	30	2026-02-05 20:56:58.223	\N
24	6	16	6	2026-02-05 20:57:00.84	\N
25	11	27	11	2026-02-05 20:57:03.542	\N
26	1	26	1	2026-02-05 20:57:09.657	\N
27	23	15	23	2026-02-05 20:57:42.954	\N
28	2	17	2	2026-02-05 20:57:44.864	\N
29	5	33	5	2026-02-05 20:57:46.794	\N
30	9	2	9	2026-02-05 20:57:48.713	\N
31	1	5	1	2026-02-05 20:57:50.519	\N
32	29	27	29	2026-02-05 20:57:52.483	\N
33	29	32	29	2026-02-05 20:57:55.57	\N
34	11	7	11	2026-02-05 21:06:18.471	\N
35	18	3	18	2026-02-05 21:06:24.558	\N
36	25	26	25	2026-02-05 21:06:27.779	\N
37	6	19	6	2026-02-05 21:06:33.175	\N
38	18	1	18	2026-02-05 21:06:38.215	\N
39	32	27	32	2026-02-05 21:06:41.484	\N
40	1	4	1	2026-02-05 21:06:45.655	\N
41	30	28	30	2026-02-05 21:06:48.995	\N
42	21	28	21	2026-02-05 21:06:52.301	\N
43	24	22	24	2026-02-05 21:06:54.645	\N
44	26	7	26	2026-02-05 21:07:00.223	\N
45	25	5	25	2026-02-05 21:07:03.479	\N
46	13	2	13	2026-02-05 21:07:06.557	\N
47	18	9	18	2026-02-05 21:07:09.858	\N
48	20	28	20	2026-02-05 21:07:12.919	\N
49	16	24	16	2026-02-05 21:07:15.721	\N
50	3	8	3	2026-02-05 21:07:18.846	\N
51	6	18	6	2026-02-05 21:07:21.671	\N
52	20	29	20	2026-02-05 21:10:32.194	\N
53	6	18	6	2026-02-05 21:10:34.956	\N
54	11	21	11	2026-02-05 21:10:37.684	\N
55	7	28	7	2026-02-05 21:10:41.261	\N
56	32	29	32	2026-02-05 21:10:42.921	\N
57	30	23	30	2026-02-05 21:10:46.721	\N
58	9	16	9	2026-02-05 21:10:49.039	\N
59	31	34	31	2026-02-05 21:10:55.071	\N
60	19	30	19	2026-02-05 21:10:59.702	\N
61	15	8	15	2026-02-05 21:11:02.031	\N
62	28	27	28	2026-02-05 21:11:06.109	\N
63	13	18	13	2026-02-05 21:11:08.473	\N
64	2	10	2	2026-02-05 21:11:10.608	\N
65	3	2	3	2026-02-05 21:11:14.559	\N
66	6	13	6	2026-02-05 21:11:17.812	\N
67	31	16	31	2026-02-05 21:11:21.487	\N
68	30	25	30	2026-02-05 21:11:24.109	\N
69	30	1	30	2026-02-05 21:11:27.915	\N
70	26	33	26	2026-02-05 21:11:31.063	\N
71	19	9	19	2026-02-05 21:11:36.082	\N
72	11	1	11	2026-02-05 21:11:38.913	\N
73	25	23	25	2026-02-06 16:54:05.138	\N
74	7	32	7	2026-02-06 16:54:09.299	\N
75	33	8	33	2026-02-06 16:54:13.884	\N
76	10	22	10	2026-02-06 16:54:16.557	\N
77	25	18	25	2026-02-06 16:54:20.264	\N
78	1	14	1	2026-02-06 16:54:23.115	\N
79	11	31	11	2026-02-06 16:54:24.974	\N
80	17	24	17	2026-02-06 16:54:28.045	\N
81	29	28	29	2026-02-06 16:54:30.288	\N
82	2	16	2	2026-02-06 16:54:32.121	\N
83	25	3	25	2026-02-06 16:54:34.737	\N
84	21	14	21	2026-02-06 16:54:37.009	\N
85	14	22	14	2026-02-06 16:54:40.045	\N
86	9	13	9	2026-02-06 16:54:44.252	\N
87	5	7	5	2026-02-06 16:54:46.143	\N
88	15	26	15	2026-02-06 16:54:48.636	\N
89	4	21	4	2026-02-06 16:54:50.635	\N
90	20	12	20	2026-02-06 16:54:57.372	\N
91	5	18	5	2026-02-06 16:55:01.025	\N
92	33	12	33	2026-02-06 16:55:04.652	\N
93	6	19	6	2026-02-06 16:55:07.724	\N
94	1	17	1	2026-02-06 16:55:11.217	\N
95	27	28	27	2026-02-06 16:55:13.607	\N
96	12	7	12	2026-02-06 16:55:15.205	\N
97	23	16	23	2026-02-06 16:55:18.14	\N
98	5	13	5	2026-02-06 16:55:19.848	\N
99	27	28	27	2026-02-06 16:55:24.442	\N
100	29	16	29	2026-02-06 16:55:26.469	\N
101	8	7	8	2026-02-06 16:55:32.261	\N
102	21	26	21	2026-02-06 16:55:33.725	\N
103	16	22	16	2026-02-06 16:55:41.887	\N
106	7	22	7	2026-02-06 21:20:13.264	\N
107	27	7	\N	2026-02-06 21:20:15.349	\N
108	16	26	16	2026-02-06 21:20:17.426	\N
109	24	14	24	2026-02-06 21:20:20.027	\N
110	60	33	60	2026-02-07 03:06:20.951	\N
111	63	102	63	2026-02-07 15:14:06.051	\N
112	33	102	33	2026-02-07 15:14:13.257	\N
113	11	30	11	2026-02-07 15:14:18.688	\N
114	81	70	81	2026-02-07 15:15:31.732	\N
115	83	66	83	2026-02-07 15:15:39.217	\N
116	96	94	96	2026-02-07 15:15:49.345	\N
117	5	1	5	2026-02-07 15:15:59.066	\N
118	97	17	97	2026-02-07 15:16:05.486	\N
119	9	25	9	2026-02-07 15:16:12.534	\N
120	89	98	89	2026-02-07 15:16:23.152	\N
121	84	42	84	2026-02-07 15:16:42.875	\N
122	66	94	66	2026-02-07 15:16:52.685	\N
123	49	86	49	2026-02-07 15:17:10.815	\N
124	62	87	62	2026-02-07 15:17:18.372	\N
125	82	88	82	2026-02-07 15:17:24.846	\N
126	6	9	6	2026-02-07 15:17:35.884	\N
127	10	53	10	2026-02-07 15:18:35.405	\N
128	96	84	96	2026-02-07 15:18:45.074	\N
129	4	97	4	2026-02-07 15:18:48.422	\N
130	80	90	80	2026-02-07 15:18:55.359	\N
131	90	88	90	2026-02-07 15:19:03.882	\N
132	87	86	87	2026-02-07 15:19:10.739	\N
133	19	9	19	2026-02-07 15:19:17.183	\N
134	19	6	19	2026-02-07 15:19:26.129	\N
135	88	94	88	2026-02-07 15:19:30.206	\N
136	11	6	11	2026-02-07 15:19:33.505	\N
137	81	15	81	2026-02-07 15:19:39.011	\N
138	17	70	17	2026-02-07 15:19:55.326	\N
139	77	43	77	2026-02-07 15:20:04.577	\N
140	45	61	45	2026-02-07 15:20:17.359	\N
141	68	44	68	2026-02-07 15:20:28.251	\N
142	100	91	100	2026-02-07 15:20:35.709	\N
143	92	74	92	2026-02-07 15:20:46.666	\N
144	70	86	70	2026-02-07 15:20:57.506	\N
145	16	42	16	2026-02-07 15:21:03.261	\N
146	11	19	11	2026-02-07 15:21:08.707	\N
147	18	12	18	2026-02-07 15:21:15.767	\N
148	48	41	\N	2026-02-07 15:21:35.236	\N
149	23	64	23	2026-02-07 15:21:42.849	\N
150	46	90	46	2026-02-07 15:21:51.463	\N
151	7	32	7	2026-02-07 15:22:11.924	\N
152	21	52	21	2026-02-07 15:22:26.94	\N
153	8	14	8	2026-02-07 15:22:38.811	\N
154	10	100	10	2026-02-07 15:22:43.784	\N
155	5	6	5	2026-02-07 15:22:52.931	\N
156	44	43	44	2026-02-07 15:23:02.137	\N
157	46	82	46	2026-02-07 15:23:23.471	\N
158	73	101	73	2026-02-07 15:23:33.1	\N
159	7	12	7	2026-02-07 15:23:43.205	\N
160	74	64	74	2026-02-07 15:23:48.62	\N
161	99	75	\N	2026-02-07 15:24:04.198	\N
162	14	94	14	2026-02-07 15:24:12.36	\N
163	77	62	77	2026-02-07 15:24:18.423	\N
164	3	1	3	2026-02-07 15:24:23.469	\N
165	27	32	27	2026-02-07 15:24:48.348	\N
166	14	43	14	2026-02-07 15:24:52.887	\N
167	14	98	14	2026-02-07 15:25:01.082	\N
168	5	19	5	2026-02-07 15:25:12.023	\N
169	2	68	2	2026-02-07 15:25:18.561	\N
170	62	59	62	2026-02-07 15:25:30.317	\N
171	18	13	18	2026-02-07 15:25:37.989	\N
172	32	22	32	2026-02-07 15:25:47.029	\N
173	51	47	51	2026-02-07 15:26:03.316	\N
174	26	86	26	2026-02-07 15:26:20.556	\N
175	93	100	93	2026-02-07 15:26:26.452	\N
176	82	66	82	2026-02-07 15:26:34.187	\N
177	76	44	76	2026-02-07 15:26:39.117	\N
178	102	64	102	2026-02-07 15:26:52.031	\N
179	70	44	70	2026-02-07 15:26:57.708	\N
180	66	102	66	2026-02-07 15:27:06.823	\N
181	100	88	100	2026-02-07 15:27:11.074	\N
182	56	15	56	2026-02-07 22:46:38.727	cml8zmoj10000lq01dsv92r8r
183	50	57	50	2026-02-07 22:46:44.027	cml8zmoj10000lq01dsv92r8r
184	88	44	\N	2026-02-07 22:46:49.165	cml8zmoj10000lq01dsv92r8r
185	7	13	7	2026-02-07 23:29:20.055	cml8zmoj10000lq01dsv92r8r
186	18	82	\N	2026-02-08 00:59:54.022	cmld1c7ig000imi01uf7ikzgc
187	44	88	44	2026-02-08 01:01:20.5	cmld1c7ig000imi01uf7ikzgc
188	58	99	58	2026-02-08 01:01:28.029	cmld1c7ig000imi01uf7ikzgc
189	75	85	75	2026-02-08 01:02:06.273	cmld1c7ig000imi01uf7ikzgc
190	6	5	\N	2026-02-08 01:02:12.705	cmld1c7ig000imi01uf7ikzgc
191	86	94	\N	2026-02-08 01:02:17.777	cmld1c7ig000imi01uf7ikzgc
192	46	81	\N	2026-02-08 01:02:23.668	cmld1c7ig000imi01uf7ikzgc
193	48	17	\N	2026-02-08 01:02:32.305	cmld1c7ig000imi01uf7ikzgc
194	89	83	89	2026-02-08 01:02:45.949	cmld1c7ig000imi01uf7ikzgc
195	25	3	25	2026-02-08 01:02:52.97	cmld1c7ig000imi01uf7ikzgc
196	74	66	74	2026-02-08 01:03:30.349	cmld1c7ig000imi01uf7ikzgc
197	21	63	\N	2026-02-08 01:03:39.847	cmld1c7ig000imi01uf7ikzgc
198	20	60	\N	2026-02-08 01:03:45.387	cmld1c7ig000imi01uf7ikzgc
199	98	102	98	2026-02-08 01:03:50.431	cmld1c7ig000imi01uf7ikzgc
200	32	102	\N	2026-02-08 01:03:57.305	cmld1c7ig000imi01uf7ikzgc
201	66	15	66	2026-02-08 01:04:02.65	cmld1c7ig000imi01uf7ikzgc
202	55	84	55	2026-02-08 01:04:08.786	cmld1c7ig000imi01uf7ikzgc
203	30	77	30	2026-02-08 01:04:14.467	cmld1c7ig000imi01uf7ikzgc
204	79	24	\N	2026-02-08 01:07:50.061	cmld1c7ig000imi01uf7ikzgc
205	101	98	101	2026-02-08 01:07:55.129	cmld1c7ig000imi01uf7ikzgc
206	100	95	100	2026-02-08 01:08:02.783	cmld1c7ig000imi01uf7ikzgc
207	101	83	101	2026-02-08 01:08:09.702	cmld1c7ig000imi01uf7ikzgc
208	87	97	87	2026-02-08 01:08:17.222	cmld1c7ig000imi01uf7ikzgc
209	101	80	101	2026-02-08 01:08:22.403	cmld1c7ig000imi01uf7ikzgc
210	42	26	\N	2026-02-08 01:08:29.161	cmld1c7ig000imi01uf7ikzgc
211	12	27	12	2026-02-08 01:08:35.023	cmld1c7ig000imi01uf7ikzgc
212	79	68	79	2026-02-08 02:25:52.628	cml8zmoj10000lq01dsv92r8r
213	103	42	103	2026-02-08 19:07:14.097	cml8zmoj10000lq01dsv92r8r
214	11	7	11	2026-02-08 19:07:21.967	cml8zmoj10000lq01dsv92r8r
215	104	84	104	2026-02-08 19:07:30.043	cml8zmoj10000lq01dsv92r8r
216	18	46	18	2026-02-08 19:07:37.34	cml8zmoj10000lq01dsv92r8r
217	14	68	\N	2026-02-08 19:07:47.011	cml8zmoj10000lq01dsv92r8r
218	5	16	5	2026-02-08 19:07:52.084	cml8zmoj10000lq01dsv92r8r
219	87	30	87	2026-02-08 19:08:00.509	cml8zmoj10000lq01dsv92r8r
220	30	42	\N	2026-02-08 19:08:09.889	cml8zmoj10000lq01dsv92r8r
221	24	48	24	2026-02-08 19:08:19.255	cml8zmoj10000lq01dsv92r8r
222	19	82	19	2026-02-08 19:08:26.705	cml8zmoj10000lq01dsv92r8r
223	1	29	1	2026-02-08 19:08:32.599	cml8zmoj10000lq01dsv92r8r
224	5	1	5	2026-02-08 19:08:41.129	cml8zmoj10000lq01dsv92r8r
225	29	82	29	2026-02-08 19:08:51.799	cml8zmoj10000lq01dsv92r8r
226	79	45	79	2026-02-08 19:08:59.805	cml8zmoj10000lq01dsv92r8r
227	41	76	41	2026-02-08 19:09:04.824	cml8zmoj10000lq01dsv92r8r
228	24	5	24	2026-02-08 19:09:12.099	cml8zmoj10000lq01dsv92r8r
229	76	46	76	2026-02-08 19:09:18.107	cml8zmoj10000lq01dsv92r8r
230	97	71	97	2026-02-08 19:09:27.253	cml8zmoj10000lq01dsv92r8r
231	76	69	76	2026-02-08 19:09:40.109	cml8zmoj10000lq01dsv92r8r
232	45	69	45	2026-02-08 19:12:07.139	cml8zmoj10000lq01dsv92r8r
233	52	8	52	2026-02-08 19:12:12.952	cml8zmoj10000lq01dsv92r8r
234	7	71	7	2026-02-08 19:14:00.299	cml8zmoj10000lq01dsv92r8r
235	57	27	57	2026-02-08 19:14:07.409	cml8zmoj10000lq01dsv92r8r
236	23	90	23	2026-02-08 19:14:12.856	cml8zmoj10000lq01dsv92r8r
237	18	5	18	2026-02-08 19:14:25.251	cml8zmoj10000lq01dsv92r8r
238	56	25	56	2026-02-08 19:14:33.646	cml8zmoj10000lq01dsv92r8r
239	10	22	10	2026-02-09 00:50:53.254	cml8zmoj10000lq01dsv92r8r
240	3	29	3	2026-02-09 00:50:59.726	cml8zmoj10000lq01dsv92r8r
241	16	8	16	2026-02-09 00:51:11.817	cml8zmoj10000lq01dsv92r8r
242	4	44	4	2026-02-09 00:51:21.552	cml8zmoj10000lq01dsv92r8r
243	66	9	66	2026-02-09 15:50:58.741	cml9xqamk0000p501dc0idtmt
244	8	29	8	2026-02-09 15:51:02.387	cml9xqamk0000p501dc0idtmt
245	105	69	105	2026-02-09 15:51:10.357	cml9xqamk0000p501dc0idtmt
246	67	64	67	2026-02-09 15:51:14.821	cml9xqamk0000p501dc0idtmt
247	2	71	2	2026-02-09 15:51:22.469	cml9xqamk0000p501dc0idtmt
248	60	66	60	2026-02-09 15:51:25.365	cml9xqamk0000p501dc0idtmt
249	67	65	67	2026-02-09 15:51:32.804	cml9xqamk0000p501dc0idtmt
250	61	28	61	2026-02-09 15:51:36.463	cml9xqamk0000p501dc0idtmt
251	26	97	26	2026-02-09 15:51:38.844	cml9xqamk0000p501dc0idtmt
252	67	30	67	2026-02-09 15:51:46.568	cml9xqamk0000p501dc0idtmt
253	91	8	91	2026-02-09 15:52:36.042	cml9xqamk0000p501dc0idtmt
254	23	10	23	2026-02-09 15:52:40.839	cml9xqamk0000p501dc0idtmt
255	14	101	14	2026-02-09 15:52:43.793	cml9xqamk0000p501dc0idtmt
256	49	99	49	2026-02-09 15:52:46.392	cml9xqamk0000p501dc0idtmt
257	57	18	57	2026-02-09 15:52:50.457	cml9xqamk0000p501dc0idtmt
258	9	46	9	2026-02-09 15:52:53.535	cml9xqamk0000p501dc0idtmt
259	102	7	102	2026-02-09 15:52:56.032	cml9xqamk0000p501dc0idtmt
260	48	101	48	2026-02-09 15:53:00.379	cml9xqamk0000p501dc0idtmt
261	17	8	17	2026-02-09 15:53:04.576	cml9xqamk0000p501dc0idtmt
262	14	30	14	2026-02-09 15:53:10.304	cml9xqamk0000p501dc0idtmt
263	33	22	33	2026-02-09 15:53:14.1	cml9xqamk0000p501dc0idtmt
264	20	28	20	2026-02-09 15:53:16.55	cml9xqamk0000p501dc0idtmt
265	20	98	20	2026-02-09 15:53:19.87	cml9xqamk0000p501dc0idtmt
267	52	90	52	2026-02-09 15:53:27.316	cml9xqamk0000p501dc0idtmt
269	105	2	105	2026-02-09 15:53:33.36	cml9xqamk0000p501dc0idtmt
270	31	99	31	2026-02-09 15:53:37.322	cml9xqamk0000p501dc0idtmt
272	60	27	60	2026-02-09 15:53:44.582	cml9xqamk0000p501dc0idtmt
274	60	92	60	2026-02-09 15:53:54.314	cml9xqamk0000p501dc0idtmt
276	102	18	102	2026-02-09 15:54:07.612	cml9xqamk0000p501dc0idtmt
278	73	16	73	2026-02-09 15:54:14.718	cml9xqamk0000p501dc0idtmt
279	88	42	88	2026-02-09 15:54:18.16	cml9xqamk0000p501dc0idtmt
281	4	55	4	2026-02-09 15:54:24.607	cml9xqamk0000p501dc0idtmt
283	104	78	104	2026-02-09 15:54:30.348	cml9xqamk0000p501dc0idtmt
285	103	69	103	2026-02-09 15:54:36.038	cml9xqamk0000p501dc0idtmt
287	76	97	76	2026-02-09 15:54:42.823	cml9xqamk0000p501dc0idtmt
289	13	28	13	2026-02-09 15:55:03.569	cml9xqamk0000p501dc0idtmt
291	14	60	14	2026-02-09 15:55:10.543	cml9xqamk0000p501dc0idtmt
293	80	43	80	2026-02-09 15:55:16.087	cml9xqamk0000p501dc0idtmt
295	41	28	41	2026-02-09 15:55:22.693	cml9xqamk0000p501dc0idtmt
297	44	98	44	2026-02-09 15:55:31.939	cml9xqamk0000p501dc0idtmt
299	2	42	2	2026-02-09 15:55:41.244	cml9xqamk0000p501dc0idtmt
266	58	67	58	2026-02-09 15:53:24.413	cml9xqamk0000p501dc0idtmt
268	104	61	104	2026-02-09 15:53:29.985	cml9xqamk0000p501dc0idtmt
271	6	25	6	2026-02-09 15:53:40.077	cml9xqamk0000p501dc0idtmt
273	63	100	63	2026-02-09 15:53:48.159	cml9xqamk0000p501dc0idtmt
275	50	91	50	2026-02-09 15:54:03.615	cml9xqamk0000p501dc0idtmt
277	46	69	46	2026-02-09 15:54:12.114	cml9xqamk0000p501dc0idtmt
280	18	28	18	2026-02-09 15:54:22.441	cml9xqamk0000p501dc0idtmt
282	78	69	78	2026-02-09 15:54:27.465	cml9xqamk0000p501dc0idtmt
284	77	18	77	2026-02-09 15:54:33.282	cml9xqamk0000p501dc0idtmt
286	50	25	50	2026-02-09 15:54:39.68	cml9xqamk0000p501dc0idtmt
288	79	52	79	2026-02-09 15:54:55.515	cml9xqamk0000p501dc0idtmt
290	99	16	99	2026-02-09 15:55:07.207	cml9xqamk0000p501dc0idtmt
292	57	52	57	2026-02-09 15:55:13.686	cml9xqamk0000p501dc0idtmt
294	68	83	68	2026-02-09 15:55:19.854	cml9xqamk0000p501dc0idtmt
296	78	60	78	2026-02-09 15:55:27.617	cml9xqamk0000p501dc0idtmt
298	8	9	8	2026-02-09 15:55:35.782	cml9xqamk0000p501dc0idtmt
300	75	71	75	2026-02-10 02:25:05.399	cml8zmoj10000lq01dsv92r8r
301	44	8	44	2026-02-10 02:25:14.091	cml8zmoj10000lq01dsv92r8r
302	81	8	81	2026-02-10 02:25:29.527	cml8zmoj10000lq01dsv92r8r
303	92	53	92	2026-02-10 02:25:34.647	cml8zmoj10000lq01dsv92r8r
304	45	91	45	2026-02-10 02:25:39.41	cml8zmoj10000lq01dsv92r8r
305	10	95	10	2026-02-14 00:46:45.376	cml8zmoj10000lq01dsv92r8r
306	28	59	28	2026-02-14 00:46:57.278	cml8zmoj10000lq01dsv92r8r
307	23	62	23	2026-02-14 00:47:04.437	cml8zmoj10000lq01dsv92r8r
\.


--
-- Data for Name: Comment; Type: TABLE DATA; Schema: public; Owner: mixtape
--

COPY public."Comment" (id, content, "songId", "userId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Invite; Type: TABLE DATA; Schema: public; Owner: mixtape
--

COPY public."Invite" (id, email, token, "expiresAt", "usedAt", "invitedById", "createdAt") FROM stdin;
cml9pnebh000152tczkm1mot6	upbeatjunk@gmail.com	d31067022069691f0cd6b95d78a86161987709277d1fdba1a5cfdd70032740d9	2026-02-08 17:08:36.792	\N	\N	2026-02-05 17:08:36.795
cml9ppoec0001529oys3uex22	upbeatjunk@gmail.com	7c07bad4cf9ef4dceeca17b74a04cbc040c8be88ba39a7ca20e699cf98b23601	2026-02-08 17:10:23.127	\N	\N	2026-02-05 17:10:23.173
cml9prb3r0003529oabmcjhe5	upbeatjunk@gmail.com	f6d98e70118fcbc394cd4a0c178bced535aab7cf8a42f12fc1e33dec64d53fe7	2026-02-08 17:11:39.251	\N	\N	2026-02-05 17:11:39.254
cml9putq40001523kx9ps7blz	upbeatjunk@gmail.com	a0c6fc233c0e4a387875782b1cb73c6f9994fd1ea619cd9ed4faed3ad0943690	2026-02-08 17:14:23.337	\N	\N	2026-02-05 17:14:23.356
cml9pvuqe0003523km3nj4ffd	upbeatjunk@gmail.com	d2b01f3993e91fa053715e392299e5ff09a1f066ef443ce97e9166291c335128	2026-02-08 17:15:11.315	\N	\N	2026-02-05 17:15:11.318
cml9px7ts0005523kmlwjhnyr	upbeatjunk@gmail.com	c1bac64bd7bf38b446c5d79afcf868d2f154b6504c268b969b176bfa17df447c	2026-02-08 17:16:14.94	\N	\N	2026-02-05 17:16:14.943
cml9v0sbi0001mq014xldjse2	hank.king2018@gmail.com	928b3632335784f511248b4a8033ad1e57add0f43e5c550b3d7a7b2de742e965	2026-02-08 19:38:59.548	\N	\N	2026-02-05 19:38:59.549
cml9xkwic0001n501mb4jqf7x	hank.king2018@gmail.com	0f0a76b1c68f5bd717ab19a719594b41c7df07b8e564b77b6e4b96ac7ba811f8	2026-02-08 20:50:37.33	2026-02-05 20:54:48.913	\N	2026-02-05 20:50:37.332
cml9xvuxr0001mc010wr7t74z	nicoledyer331@yahoo.com	406cebea45a1a1aac4433f70a6c82896d6c4b562cb1f760b0bba92a79b1b1ebd	2026-02-08 20:59:08.509	2026-02-07 17:02:34.068	\N	2026-02-05 20:59:08.511
cmld02gh4000fmi01aszqbgai	clarejhickey@gmail.com	7495760c264bc55c68bce0fcba995d7bfa41153a115099766da7c713be9a8140	2026-02-11 00:23:34.119	\N	\N	2026-02-08 00:23:34.12
cmld03dwd000hmi01kz3xkuyo	angelica.mcadam21@gmail.com	a9888609601091bfbccd21508d41a8a04e688036ff136e805abd97ad939cb965	2026-02-11 00:24:17.437	\N	\N	2026-02-08 00:24:17.438
cmld021ae000dmi01polowubr	nicoleadams828@gmail.com	3c202c434eb9dbeac66d53efdc32cb80647be7b56d77ba7418506a98543f3fb5	2026-02-11 00:23:14.436	2026-02-08 00:59:08.685	\N	2026-02-08 00:23:14.437
cmldubt1g0001r401gktj3xc7	angelica.mcadam21@gmail.com	335f869726d730938eb5ae85c04c0951b30338378cd70a2a3ebe80769302252a	2026-02-11 14:30:38.787	\N	\N	2026-02-08 14:30:38.788
\.


--
-- Data for Name: PasswordReset; Type: TABLE DATA; Schema: public; Owner: mixtape
--

COPY public."PasswordReset" (id, email, token, "expiresAt", "usedAt", "createdAt") FROM stdin;
cmlbs7jtx0000n001drs96drw	hank.king2018@gmail.com	815491ae52d76dbd2539c0b89b6586d02adc71d6111887ac92a7e9e7d733a4c5	2026-02-08 03:55:48.644	\N	2026-02-07 03:55:48.645
cmlcje5vk0047n00153u4bw76	tim@levesques.net	cc1d971ad818c6fb5e8be5cf38e8d6cc03f8347babc45840a9d0e00e22cf1eee	2026-02-08 16:36:46.784	2026-02-07 16:37:11.676	2026-02-07 16:36:46.784
\.


--
-- Data for Name: PracticeListItem; Type: TABLE DATA; Schema: public; Owner: mixtape
--

COPY public."PracticeListItem" (id, "userId", "songId", status, priority, notes, "addedAt", "updatedAt") FROM stdin;
cmliw8mmb0001lh01fllnuu7m	cml8zmoj10000lq01dsv92r8r	53	LEARNING	3	\N	2026-02-12 03:23:00.612	2026-02-14 00:46:06.388
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: mixtape
--

COPY public."Session" (id, "sessionToken", "userId", expires) FROM stdin;
\.


--
-- Data for Name: Song; Type: TABLE DATA; Schema: public; Owner: mixtape
--

COPY public."Song" (id, title, artist, elo, album, "releaseDate", spotify, apple, youtube, bandcamp, soundcloud, lyrics, songsterr, "ultimateGuitar", "createdAt", "updatedAt", decade, "energyMood", genre, "albumArtUrl", "durationMs", "keyNotes", "lastPracticedAt", "tuningNotes") FROM stdin;
6	Long Run	The Eagles	1516	The Long Run	1979	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-05 05:08:23.242	2026-02-09 15:53:40.077	1980	\N	\N	https://coverartarchive.org/release/cd027be6-fabf-4d35-bd88-60b0f3016f89/front-500	\N	\N	\N	\N
64	Against the wind	Bob Seger	1484	1980-01-15: Radio Broadcast Cobo Arena, Detroit	\N	\N	\N	https://music.youtube.com/search?q=Bob%20Seger%20Against%20the%20wind	\N	\N	https://www.google.com/search?q=Bob%20Seger%20Against%20the%20wind%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Bob%20Seger%20Against%20the%20wind	https://www.ultimate-guitar.com/search.php?title=Bob%20Seger%20Against%20the%20wind&type=300	2026-02-07 13:38:47.635	2026-02-09 15:51:14.821	\N	\N	\N	https://coverartarchive.org/release/2bc239ac-6a16-4436-8a8d-f36951236879/front-500	\N	\N	\N	\N
60	Everybody Wants You	Billy Squier	1512.336371178657	Extended Versions: The Encore Collection	2002	\N	\N	https://music.youtube.com/search?q=Billy%20Squier%20Everybody%20Wants%20You	\N	\N	https://www.google.com/search?q=Billy%20Squier%20Everybody%20Wants%20You%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Billy%20Squier%20Everybody%20Wants%20You	https://www.ultimate-guitar.com/search.php?title=Billy%20Squier%20Everybody%20Wants%20You&type=300	2026-02-07 02:32:23.789	2026-02-09 15:55:27.617	2000	\N	\N	https://coverartarchive.org/release/d0e26f5c-2e98-480c-9f2a-f8243ab6b9e8/front-500	274426	\N	\N	\N
66	Old Time Rock and Roll	Bob Seger	1499.263693206478	Risky Business	1984	\N	\N	https://music.youtube.com/search?q=Bob%20Seger%20Old%20Time%20Rock%20n%20Roll	\N	\N	https://www.google.com/search?q=Bob%20Seger%20Old%20Time%20Rock%20n%20Roll%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Bob%20Seger%20Old%20Time%20Rock%20n%20Roll	https://www.ultimate-guitar.com/search.php?title=Bob%20Seger%20Old%20Time%20Rock%20n%20Roll&type=300	2026-02-07 13:40:03.018	2026-02-09 15:51:25.365	1980	\N	\N	https://coverartarchive.org/release/a218894f-a558-4283-b9ab-ba57fafea6fe/front-500	199266	\N	\N	\N
16	Love Is a Battlefield	Pat Benatar	1467.297532827475	Live from Earth	1983	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-05 05:08:23.256	2026-02-09 15:55:07.207	1980	\N	\N	https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/53/18/8b/53188bda-a5fd-865c-25c7-3dfc1763c639/14ULAIM00646.rgb.jpg/600x600bb.jpg	236000	\N	\N	\N
62	Tangled up in Blue	Bob Dylan	1484.736306793522	Blood On the Tracks	1975	\N	\N	https://music.youtube.com/search?q=Bob%20Dylan%20Tangled%20up%20in%20Blue	\N	\N	https://www.google.com/search?q=Bob%20Dylan%20Tangled%20up%20in%20Blue%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Bob%20Dylan%20Tangled%20up%20in%20Blue	https://www.ultimate-guitar.com/search.php?title=Bob%20Dylan%20Tangled%20up%20in%20Blue&type=300	2026-02-07 13:36:13.25	2026-02-14 00:47:04.437	1970	\N	\N	https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/34/6e/4d/346e4d1c-c9ef-cf7f-96d9-aad97286febb/074643323529.jpg/600x600bb.jpg	507560	\N	\N	\N
52	Tennessee Whiskey	Chris Stapleton	1484.033833021121	Life Goes On: Musicians Against Childhood Cancer	2012	\N	\N	https://music.youtube.com/search?q=Chris%20Stapleton%20Tennessee%20Whiskey	\N	\N	https://www.google.com/search?q=Chris%20Stapleton%20Tennessee%20Whiskey%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Chris%20Stapleton%20Tennessee%20Whiskey	https://www.ultimate-guitar.com/search.php?title=Chris%20Stapleton%20Tennessee%20Whiskey&type=300	2026-02-06 22:43:28.471	2026-02-09 15:55:13.686	2010	\N	\N	https://coverartarchive.org/release/494f6d1a-0349-4f5a-9383-30aa4b3bb989/front-500	196306	\N	\N	\N
51	Parachute	Chris Stapleton	1500	So Country 2017	2017	\N	\N	https://music.youtube.com/search?q=Chris%20Stapleton%20Parachutte	\N	\N	https://www.google.com/search?q=Chris%20Stapleton%20Parachutte%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Chris%20Stapleton%20Parachutte	https://www.ultimate-guitar.com/search.php?title=Chris%20Stapleton%20Parachutte&type=300	2026-02-06 22:42:29.403	2026-02-09 05:10:54.612	2010	\N	country	https://coverartarchive.org/release/336ba9d6-253a-4c87-bc8f-8a7d8cf4ea0b/front-500	253000	\N	\N	\N
7	Holdin' Heaven	Tracy Byrd	1484	Don't Throw Stones	1994	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-05 05:08:23.243	2026-02-09 15:52:56.032	1990	\N	\N	https://coverartarchive.org/release/843e34e5-56fd-4a59-b026-91293791365a/front-500	152413	\N	\N	\N
33	Yellow	Coldplay	1516	Cities 97 Sampler, Volume 13	2001	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-05 05:08:23.279	2026-02-09 15:53:14.1	2000	\N	\N	https://coverartarchive.org/release/ecf40ed5-cc55-4462-a9a9-69e021d6911f/front-500	290226	\N	\N	\N
9	Can't You See	Marshall Tucker Band	1483.933898451635	The Marshall Tucker Band	1973	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-05 05:08:23.245	2026-02-09 15:55:35.782	\N	\N	\N	https://coverartarchive.org/release/1c16540b-d855-4d93-8012-a670fc420e96/front-500	373000	\N	\N	\N
103	Mama, I'm Coming Home	Ozzy Osbourne	1513.868447488412	The Best	2006	\N	\N	https://music.youtube.com/search?q=Ozzy%20Osbourne%20Mama%2C%20I'm%20Coming%20Home	\N	\N	https://www.google.com/search?q=Ozzy%20Osbourne%20Mama%2C%20I'm%20Coming%20Home%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Ozzy%20Osbourne%20Mama%2C%20I'm%20Coming%20Home	https://www.ultimate-guitar.com/search.php?title=Ozzy%20Osbourne%20Mama%2C%20I'm%20Coming%20Home&type=300	2026-02-08 14:29:03.557	2026-02-09 15:54:36.038	2000	\N	\N	https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/8e/ef/44/8eef4402-508e-860e-a3c0-9be46cf2379e/696998524828.jpg/600x600bb.jpg	256000	\N	\N	\N
58	People are Crazy	Billy Currington	1518.098294208848	Little Bit of Everything	2008	\N	\N	https://music.youtube.com/search?q=Billy%20Currington%20People%20are%20Crazy	\N	\N	https://www.google.com/search?q=Billy%20Currington%20People%20are%20Crazy%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Billy%20Currington%20People%20are%20Crazy	https://www.ultimate-guitar.com/search.php?title=Billy%20Currington%20People%20are%20Crazy&type=300	2026-02-07 02:15:34.855	2026-02-11 01:00:48.394	2000	\N	country	https://coverartarchive.org/release/a46e57f9-a0fc-4d8e-a6c5-e7e3fd66ef8f/front-500	231502	\N	2026-02-11 01:00:48.393	\N
104	Shakin	Eddie Money	1532.634655630229	Greatest Hits Live: The Encore Collection	1998	\N	\N	https://music.youtube.com/search?q=Eddie%20Money%20Shakin	\N	\N	https://www.google.com/search?q=Eddie%20Money%20Shakin%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Eddie%20Money%20Shakin	https://www.ultimate-guitar.com/search.php?title=Eddie%20Money%20Shakin&type=300	2026-02-08 16:16:02.352	2026-02-11 00:22:00.935	1990	\N	\N	https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/2e/7c/e6/2e7ce64e-e55f-bd7b-e164-ecf24c55e4fb/mzi.kjhahyhd.jpg/600x600bb.jpg	290640	Key of A	2026-02-11 00:22:00.934	Standard Tuning
44	Heart like a truck	Lainey Wilson	1530.596623178897	Bell Bottom Country	\N	\N	\N	https://music.youtube.com/search?q=Lainey%20Wilson%20Heart%20like%20a%20truck	\N	\N	https://www.google.com/search?q=Lainey%20Wilson%20Heart%20like%20a%20truck%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Lainey%20Wilson%20Heart%20like%20a%20truck	https://www.ultimate-guitar.com/search.php?title=Lainey%20Wilson%20Heart%20like%20a%20truck&type=300	2026-02-06 22:23:06.953	2026-02-11 00:42:21.555	\N	\N	\N	https://coverartarchive.org/release/fb27de3d-0647-4cfc-a3aa-f76ec210e559/front-500	199000	\N	2026-02-11 00:42:21.552	\N
10	That's Just About Right	Blackhawk	1500.736306793522	Blackhawk	1994	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-05 05:08:23.246	2026-02-14 00:46:45.376	2010	\N	\N	https://coverartarchive.org/release/eff7a123-bf7f-45f8-9b34-45816a3751a4/front-500	607056	\N	\N	\N
27	Sugar Sweet	Jeff Healey	1484.770139814643	See the Light	1988	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-05 05:08:23.272	2026-02-09 15:53:44.582	2000	\N	\N	https://coverartarchive.org/release/6a00b7f1-4890-4769-b324-5666a4e64ee3/front-500	226160	\N	\N	\N
23	Dirty Little Secret	The All-American Rejects	1531.263693206478	Move Along	2006	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-05 05:08:23.267	2026-02-14 00:47:04.437	2000	\N	rock	https://coverartarchive.org/release/62cdca77-ed51-434d-9f87-22b58fa0b6b4/front-500	188000	\N	2026-02-11 01:13:55.154	\N
46	All the time	Zach Bryan	1499.297601336647	Summertime Blues	2022	\N	\N	https://music.youtube.com/search?q=Zach%20Bryan%20All%20the%20time	\N	\N	https://www.google.com/search?q=Zach%20Bryan%20All%20the%20time%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Zach%20Bryan%20All%20the%20time	https://www.ultimate-guitar.com/search.php?title=Zach%20Bryan%20All%20the%20time&type=300	2026-02-06 22:25:48.673	2026-02-09 15:54:12.114	2020	\N	\N	https://coverartarchive.org/release/cf4b363b-3000-4fae-9c58-4131a1769ddb/front-500	199500	\N	\N	\N
5	Mountain Sound	Of Monsters and Men	1500	My Head Is an Animal	2011	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-05 05:08:23.24	2026-02-09 05:10:54.612	2010	\N	folk rock	https://coverartarchive.org/release/0b9534bc-5d7b-4ae0-af47-6d4c234733d6/front-500	212000	\N	\N	\N
3	Something in the Orange	Zach Bryan	1500	DeAnn	2022	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-05 05:08:23.238	2026-02-09 05:10:54.612	\N	\N	\N	https://coverartarchive.org/release/31b86ca1-481a-4731-87fa-b3a0e91bd4d3/front-500	271882	\N	\N	\N
49	Goodbye Says it All	Blackhawk	1516	Pure... Country Stars	2014	\N	\N	https://music.youtube.com/search?q=Blackhawk%20Goodbye%20Says%20it%20All	\N	\N	https://www.google.com/search?q=Blackhawk%20Goodbye%20Says%20it%20All%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Blackhawk%20Goodbye%20Says%20it%20All	https://www.ultimate-guitar.com/search.php?title=Blackhawk%20Goodbye%20Says%20it%20All&type=300	2026-02-06 22:39:48.374	2026-02-09 15:52:46.392	1990	\N	country	https://coverartarchive.org/release/20ef09ba-9dd4-4e6f-89a8-32fc36fdd68a/front-500	204026	\N	\N	\N
4	Slide	Goo Goo Dolls	1516	Dizzy Up the Girl	1998	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-05 05:08:23.239	2026-02-11 01:18:43.944	1990	\N	\N	https://coverartarchive.org/release/7ba16e5a-f720-46ce-a755-a12d30c6a058/front-500	213400	\N	2026-02-11 01:18:43.941	\N
30	Slow Dancing in a Burning Room	John Mayer	1470.839783273094	Continuum	2006	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-05 05:08:23.275	2026-02-09 15:53:10.304	2000	\N	rock	https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/7a/a0/f4/7aa0f487-f983-390e-73ef-005115eea1e0/dj.oqpplyfm.jpg/600x600bb.jpg	233760	\N	\N	\N
22	Folsom Prison Blues	Johnny Cash	1484	All Aboard the Blue Train (Definitive Expanded Remastered Edition)	1955	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-05 05:08:23.265	2026-02-09 15:53:14.1	1950	\N	\N	https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/d7/4b/b6/d74bb621-7319-d6a7-6f69-b43249253c60/LM00177737.jpg/600x600bb.jpg	112506	\N	\N	\N
106	You Don't Know Shit	James Hilton	1500	\N	\N	\N	\N	https://music.youtube.com/search?q=James%20Hilton%20You%20Don't%20Know%20Shit	\N	\N	https://www.google.com/search?q=James%20Hilton%20You%20Don't%20Know%20Shit%20lyrics	https://www.songsterr.com/a/wa/search?pattern=James%20Hilton%20You%20Don't%20Know%20Shit	https://www.ultimate-guitar.com/search.php?title=James%20Hilton%20You%20Don't%20Know%20Shit&type=300	2026-02-11 15:45:23.376	2026-02-11 15:45:23.376	\N	\N	\N	\N	\N	\N	\N	\N
25	Don't Stop Believin'	Journey	1469.504661394343	Escape	1981	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-05 05:08:23.269	2026-02-09 15:54:39.68	2000	\N	\N	https://coverartarchive.org/release/85c1e3c7-0a4c-4f51-96c5-7cdc81db2a23/front-500	283000	\N	2026-02-09 05:22:08.444	\N
8	Oh Pretty Woman	Albert King	1469.498932822369	Stax Volt Records	1967	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-05 05:08:23.244	2026-02-10 02:25:29.527	2000	\N	\N	https://coverartarchive.org/release/7f6557ef-d0b0-459f-ad39-99c5d18109f7/front-500	284000	\N	\N	\N
29	Green River	Creedence Clearwater Revival	1484	Green River	1969	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-05 05:08:23.274	2026-02-09 15:51:02.387	1960	\N	\N	https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/88/16/20/881620df-9161-61e8-2295-99c6740871b8/00888072355972.rgb.jpg/600x600bb.jpg	144666	\N	\N	\N
79	Cuts Like a Knife	Bryan Adams	1516.736306793522	Straight From the Heart	1991	\N	\N	https://music.youtube.com/search?q=Bryan%20Adams%20Cuts%20Like%20a%20Knife	\N	\N	https://www.google.com/search?q=Bryan%20Adams%20Cuts%20Like%20a%20Knife%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Bryan%20Adams%20Cuts%20Like%20a%20Knife	https://www.ultimate-guitar.com/search.php?title=Bryan%20Adams%20Cuts%20Like%20a%20Knife&type=300	2026-02-07 13:55:00.803	2026-02-11 01:06:37.43	1990	\N	\N	https://coverartarchive.org/release/ad60cbfc-7f1d-49cd-94a3-52dc0f3947c0/front-500	247000	\N	2026-02-11 01:06:37.429	\N
55	whats up	4 non blondes	1484	Whats Up	\N	\N	\N	https://music.youtube.com/search?q=4%20non%20blondes%20whats%20up	\N	\N	https://www.google.com/search?q=4%20non%20blondes%20whats%20up%20lyrics	https://www.songsterr.com/a/wa/search?pattern=4%20non%20blondes%20whats%20up	https://www.ultimate-guitar.com/search.php?title=4%20non%20blondes%20whats%20up&type=300	2026-02-07 01:08:42.737	2026-02-09 15:54:24.607	\N	\N	\N	https://coverartarchive.org/release/93fb5c96-9372-45b3-9862-839070b5c07b/front-500	303829	\N	\N	\N
84	For What It's Worth	Buffalo Springfield	1500	Buffalo Springfield	1966	\N	\N	https://music.youtube.com/search?q=Buffalo%20Springfield%20For%20What%20its%20Worth	\N	\N	https://www.google.com/search?q=Buffalo%20Springfield%20For%20What%20its%20Worth%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Buffalo%20Springfield%20For%20What%20its%20Worth	https://www.ultimate-guitar.com/search.php?title=Buffalo%20Springfield%20For%20What%20its%20Worth&type=300	2026-02-07 14:03:17.211	2026-02-09 05:10:54.612	1960	\N	\N	https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/14/12/bb/1412bb4b-d4bd-3fb6-e282-3e96b5988eed/mzi.vdwggpmt.jpg/600x600bb.jpg	229000	\N	\N	\N
11	Gild the Lily	Billy Strings	1500	Renewal	2023	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-05 05:08:23.248	2026-02-09 05:10:54.612	2020	\N	\N	https://coverartarchive.org/release/4db365db-d3b4-42d9-8448-7639e789b59e/front-500	772000	\N	2026-02-09 05:10:29.746	\N
2	Death Valley Queen	Flogging Molly	1515.263693206478	Drunken Lullabies	2002	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-05 05:08:23.237	2026-02-09 15:55:41.244	2000	\N	punk	https://coverartarchive.org/release/2fc9a409-48e2-32f0-b513-77df11a873c7/front-500	258000	\N	\N	\N
15	Seasons of Wither	Aerosmith	1500	Get Your Wings	1974	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-05 05:08:23.255	2026-02-09 05:10:54.612	1970	\N	\N	https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/3e/8a/03/3e8a0372-785d-e631-0cf0-d8fe6a3d72bc/22UM1IM35691.rgb.jpg/600x600bb.jpg	296066	\N	\N	\N
12	Guys Do It All the Time	Mindy McCready	1500	Ten Thousand Angels	1994	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-05 05:08:23.25	2026-02-09 05:10:54.612	\N	\N	\N	https://coverartarchive.org/release/46fa2389-cb96-4cb0-af32-903ef482bc9d/front-500	197400	\N	\N	\N
42	Things A Man Oughta Know	Lainey Wilson	1468.736306793522	Sayin’ What I’m Thinkin’	2021	\N	\N	https://music.youtube.com/search?q=Lainey%20Wilson%20Things%20A%20Man%20Oughta%20Know	\N	\N	https://www.google.com/search?q=Lainey%20Wilson%20Things%20A%20Man%20Oughta%20Know%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Lainey%20Wilson%20Things%20A%20Man%20Oughta%20Know	https://www.ultimate-guitar.com/search.php?title=Lainey%20Wilson%20Things%20A%20Man%20Oughta%20Know&type=300	2026-02-06 22:21:10.617	2026-02-09 15:55:41.244	2020	\N	\N	https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/71/9c/bc/719cbc6d-f1c0-ba9b-fa34-c2d4d03ae164/4050538658095.jpg/600x600bb.jpg	232000	\N	\N	\N
65	Night Moves	Bob Seger	1484.736306793522	Don’t Burn Down the Bridge (live)	2019	\N	\N	https://music.youtube.com/search?q=Bob%20Seger%20Night%20Moves	\N	\N	https://www.google.com/search?q=Bob%20Seger%20Night%20Moves%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Bob%20Seger%20Night%20Moves	https://www.ultimate-guitar.com/search.php?title=Bob%20Seger%20Night%20Moves&type=300	2026-02-07 13:39:25.248	2026-02-09 15:51:32.804	\N	\N	\N	https://coverartarchive.org/release/2bc239ac-6a16-4436-8a8d-f36951236879/front-500	\N	\N	\N	\N
56	Black Velvet	Alannah Myles	1500	The Ultimate Rock Collection: The Quieter Side	2006	\N	\N	https://music.youtube.com/search?q=Alannah%20Myles%20Black%20Velvet	\N	\N	https://www.google.com/search?q=Alannah%20Myles%20Black%20Velvet%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Alannah%20Myles%20Black%20Velvet	https://www.ultimate-guitar.com/search.php?title=Alannah%20Myles%20Black%20Velvet&type=300	2026-02-07 01:35:58.628	2026-02-09 05:10:54.612	\N	\N	\N	https://coverartarchive.org/release/5e2d303a-bb0e-467a-a903-536b2bf0148d/front-500	282400	\N	\N	\N
61	Knockin on Heavens Door	Guns n Roses	1499.263693206478	Acoustic Session in NY (FM Broadcast 1987)	\N	\N	\N	https://music.youtube.com/search?q=Guns%20n%20Roses%20Knockin%20on%20Heavens%20Door	\N	\N	https://www.google.com/search?q=Guns%20n%20Roses%20Knockin%20on%20Heavens%20Door%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Guns%20n%20Roses%20Knockin%20on%20Heavens%20Door	https://www.ultimate-guitar.com/search.php?title=Guns%20n%20Roses%20Knockin%20on%20Heavens%20Door&type=300	2026-02-07 13:35:19.518	2026-02-09 15:53:29.985	\N	\N	hard rock	https://coverartarchive.org/release/91839974-295e-4faa-8078-1b8202ed0646/front-500	\N	\N	\N	\N
77	Fire	Bruce Springsteen	1515.329683476631	Love, Tears & Mystery: The Definitive Devils & Dust Tour Compilation	\N	\N	\N	https://music.youtube.com/search?q=Bruce%20Springstein%20Fire	\N	\N	https://www.google.com/search?q=Bruce%20Springstein%20Fire%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Bruce%20Springstein%20Fire	https://www.ultimate-guitar.com/search.php?title=Bruce%20Springstein%20Fire&type=300	2026-02-07 13:52:56.619	2026-02-09 15:54:33.282	\N	\N	\N	https://coverartarchive.org/release/d0248ef6-b5c4-4cf6-a8e5-ff7db3c0517d/front-500	\N	\N	\N	\N
101	Girls Just Want to Have Fun	Cyndi Lauper	1468.736306793522	80 From America	2013	\N	\N	https://music.youtube.com/search?q=Cyndi%20Lauper%20Girls%20Just%20Want%20to%20Have%20Fun	\N	\N	https://www.google.com/search?q=Cyndi%20Lauper%20Girls%20Just%20Want%20to%20Have%20Fun%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Cyndi%20Lauper%20Girls%20Just%20Want%20to%20Have%20Fun	https://www.ultimate-guitar.com/search.php?title=Cyndi%20Lauper%20Girls%20Just%20Want%20to%20Have%20Fun&type=300	2026-02-07 14:24:53.887	2026-02-09 15:53:00.379	2010	\N	pop	https://coverartarchive.org/release/bdba1ae8-3a50-426e-a8b2-8258af44dcd4/front-500	211493	\N	\N	\N
90	Shake Me	Cinderella	1484	Caught in the Act	2011	\N	\N	https://music.youtube.com/search?q=Cinderella%20Shake%20Me	\N	\N	https://www.google.com/search?q=Cinderella%20Shake%20Me%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Cinderella%20Shake%20Me	https://www.ultimate-guitar.com/search.php?title=Cinderella%20Shake%20Me&type=300	2026-02-07 14:10:42.685	2026-02-09 15:53:27.316	1990	\N	\N	https://coverartarchive.org/release/7c0d7a19-6008-412d-8add-4f8142517a99/front-500	293867	\N	\N	\N
83	Southern Comfort	Buddy Jewel	1484	Buddy Jewell	2003	\N	\N	https://music.youtube.com/search?q=Buddy%20Jewel%20Southern%20Comfort	\N	\N	https://www.google.com/search?q=Buddy%20Jewel%20Southern%20Comfort%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Buddy%20Jewel%20Southern%20Comfort	https://www.ultimate-guitar.com/search.php?title=Buddy%20Jewel%20Southern%20Comfort&type=300	2026-02-07 14:01:23.05	2026-02-09 15:55:19.854	2000	\N	\N	https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/7c/7c/37/7c7c3780-f923-ff6a-9938-58713199c0a2/mzi.zifykztt.jpg/600x600bb.jpg	\N	\N	\N	\N
71	Thing Called Love	Bonnie Raitt	1468.736306793522	No Music, No Life	1997	\N	\N	https://music.youtube.com/search?q=Bonnie%20Raitt%20Thing%20Called%20Love	\N	\N	https://www.google.com/search?q=Bonnie%20Raitt%20Thing%20Called%20Love%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Bonnie%20Raitt%20Thing%20Called%20Love	https://www.ultimate-guitar.com/search.php?title=Bonnie%20Raitt%20Thing%20Called%20Love&type=300	2026-02-07 13:45:10.086	2026-02-10 02:25:05.399	1990	\N	\N	https://coverartarchive.org/release/d2ebb6f4-8552-4695-aba8-2d1a7d7cd76f/front-500	234160	\N	\N	\N
80	Summer of 69	Bryan Adams	1516	Live! Live! Live!	1988	\N	\N	https://music.youtube.com/search?q=Bryan%20Adams%20Summer%20of%2069	\N	\N	https://www.google.com/search?q=Bryan%20Adams%20Summer%20of%2069%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Bryan%20Adams%20Summer%20of%2069	https://www.ultimate-guitar.com/search.php?title=Bryan%20Adams%20Summer%20of%2069&type=300	2026-02-07 13:55:19.106	2026-02-09 15:55:16.087	1990	\N	rock	https://coverartarchive.org/release/a8a588f8-caf4-4801-847a-c173cf6becc9/front-500	310933	\N	\N	\N
73	Kick It In the Sticks	Brantley Gilbert	1516	Halfway to Heaven	2010	\N	\N	https://music.youtube.com/search?q=Brantley%20Gilbert%20Kick%20It%20In%20the%20Sticks	\N	\N	https://www.google.com/search?q=Brantley%20Gilbert%20Kick%20It%20In%20the%20Sticks%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Brantley%20Gilbert%20Kick%20It%20In%20the%20Sticks	https://www.ultimate-guitar.com/search.php?title=Brantley%20Gilbert%20Kick%20It%20In%20the%20Sticks&type=300	2026-02-07 13:46:29.334	2026-02-09 15:54:14.718	2010	\N	\N	https://coverartarchive.org/release/00112067-ee33-488f-9edf-85af72f62926/front-500	226760	\N	\N	\N
67	Tryin to Live my Life	Bob Seger	1527.729526119354	Transmission Impossible	\N	\N	\N	https://music.youtube.com/search?q=Bob%20Seger%20Tryin%20to%20Live%20my%20Life	\N	\N	https://www.google.com/search?q=Bob%20Seger%20Tryin%20to%20Live%20my%20Life%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Bob%20Seger%20Tryin%20to%20Live%20my%20Life	https://www.ultimate-guitar.com/search.php?title=Bob%20Seger%20Tryin%20to%20Live%20my%20Life&type=300	2026-02-07 13:40:48.648	2026-02-11 01:01:11.919	\N	\N	\N	https://coverartarchive.org/release/7f1236a3-f13c-486c-abe0-c5d6aa53c2e3/front-500	251000	\N	2026-02-11 01:01:11.918	\N
75	Nothin' 'Bout Love	Brooks & Dunn	1515.263693206478	\N	\N	\N	\N	https://music.youtube.com/search?q=Brooks%20%26%20Dunn%20Nuthin%20'bout%20You	\N	\N	https://www.google.com/search?q=Brooks%20%26%20Dunn%20Nuthin%20'bout%20You%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Brooks%20%26%20Dunn%20Nuthin%20'bout%20You	https://www.ultimate-guitar.com/search.php?title=Brooks%20%26%20Dunn%20Nuthin%20'bout%20You&type=300	2026-02-07 13:50:44.487	2026-02-10 02:25:05.399	\N	\N	\N	\N	\N	\N	\N	\N
74	Rock My World	Brooks & Dunn	1500	The Greatest Hits Collection	1993	\N	\N	https://music.youtube.com/search?q=Brooks%20%26%20Dunn%20Rock%20My%20World	\N	\N	https://www.google.com/search?q=Brooks%20%26%20Dunn%20Rock%20My%20World%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Brooks%20%26%20Dunn%20Rock%20My%20World	https://www.ultimate-guitar.com/search.php?title=Brooks%20%26%20Dunn%20Rock%20My%20World&type=300	2026-02-07 13:50:05.554	2026-02-09 05:10:54.612	1990	\N	\N	https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a4/db/c5/a4dbc5c7-bc69-931a-0e46-c6e11e86e003/078221885225.jpg/600x600bb.jpg	216840	\N	\N	\N
28	Cold Shot	Stevie Ray Vaughan & Double Trouble	1445.085214353463	Couldn't Stand the Weather (Legacy Edition)	1984	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-05 05:08:23.273	2026-02-14 00:46:57.278	1980	\N	\N	https://is1-ssl.mzstatic.com/image/thumb/Features115/v4/7b/39/22/7b3922b9-61c1-5ad9-4c68-25f41f3fd402/dj.orqmjfhi.jpg/600x600bb.jpg	362000	\N	\N	\N
45	Twice as hard	The Black Crowes	1515.998441931803	2006-09-09: Charlottesville Pavilion, Charlottesville, VA, USA	2006	\N	\N	https://music.youtube.com/search?q=The%20Black%20Crowes%20Twice%20as%20hard	\N	\N	https://www.google.com/search?q=The%20Black%20Crowes%20Twice%20as%20hard%20lyrics	https://www.songsterr.com/a/wa/search?pattern=The%20Black%20Crowes%20Twice%20as%20hard	https://www.ultimate-guitar.com/search.php?title=The%20Black%20Crowes%20Twice%20as%20hard&type=300	2026-02-06 22:24:11.292	2026-02-10 02:25:39.41	2020	\N	\N	https://coverartarchive.org/release/95f915be-5e44-41f3-9e4c-d37d6216ea03/front-500	282000	\N	\N	\N
1	Honey Bee	Tom Petty	1500	Full Moon Fever	1989	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-05 05:08:23.235	2026-02-10 13:55:10.523	\N	\N	\N	https://coverartarchive.org/release/5e2d303a-bb0e-467a-a903-536b2bf0148d/front-500	296306	E	2026-02-10 13:54:45.098	E Standard Tuning
105	Little by Little	Susan Tedeschi	1532	Just Won't Burn	1998	\N	\N	https://music.youtube.com/search?q=Susan%20Tedeschi%20Little%20by%20Little	\N	\N	https://www.google.com/search?q=Susan%20Tedeschi%20Little%20by%20Little%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Susan%20Tedeschi%20Little%20by%20Little	https://www.ultimate-guitar.com/search.php?title=Susan%20Tedeschi%20Little%20by%20Little&type=300	2026-02-08 20:19:31.284	2026-02-11 00:26:52.189	1990	\N	blues	https://coverartarchive.org/release/a7cc3b81-f973-482b-ab2a-42e6130b1623/front-500	229000	\N	2026-02-11 00:26:52.189	\N
57	How About That	Bad Co.	1531.229860185357	\N	\N	\N	\N	https://music.youtube.com/search?q=Bad%20Co.%20How%20About%20That	\N	\N	https://www.google.com/search?q=Bad%20Co.%20How%20About%20That%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Bad%20Co.%20How%20About%20That	https://www.ultimate-guitar.com/search.php?title=Bad%20Co.%20How%20About%20That&type=300	2026-02-07 01:47:58.704	2026-02-11 00:37:56.649	1990	\N	\N	https://coverartarchive.org/release/e4707ce0-a879-4d22-a1f8-2e1fe7e38ab4/front-500	320426	\N	2026-02-11 00:37:56.648	\N
91	Shelter Me	Cinderella	1483.967725047076	Live at the Keyclub	1999	\N	\N	https://music.youtube.com/search?q=Cinderella%20Shelter%20Me	\N	\N	https://www.google.com/search?q=Cinderella%20Shelter%20Me%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Cinderella%20Shelter%20Me	https://www.ultimate-guitar.com/search.php?title=Cinderella%20Shelter%20Me&type=300	2026-02-07 14:11:03.132	2026-02-10 02:25:39.41	2000	\N	\N	https://coverartarchive.org/release/c920d605-2235-4c12-8a23-3c8556c4dbb3/front-500	410000	\N	\N	\N
18	Breakdown	Tom Petty and the Heartbreakers	1470.106053237105	Damn the Torpedoes	1979	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-05 05:08:23.259	2026-02-09 15:54:33.282	1990	\N	\N	https://coverartarchive.org/release/65e1db70-ad43-4220-a632-b9c19cab0df7/front-500	290666	\N	\N	\N
19	That's How Every Empire Falls	John Prine	1500	In Spite of Ourselves	1999	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-05 05:08:23.26	2026-02-09 05:10:54.612	2000	\N	\N	https://coverartarchive.org/release/08f4bf08-8cf3-46cf-9450-61674a09a1a2/front-500	334000	\N	\N	\N
31	Crimson and Clover	Joan Jett	1515.263693206478	I Love Rock 'N' Roll (Expanded Edition)	1981	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-05 05:08:23.277	2026-02-09 15:53:37.322	1980	\N	\N	https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/09/8b/86/098b862d-7e7a-ff59-24cb-87eb83c7ee58/886447254332.jpg/600x600bb.jpg	203412	\N	\N	\N
99	Fortunate Son	CCR	1485.438773966047	\N	\N	\N	\N	https://music.youtube.com/search?q=CCR%20Fortunate%20Son	\N	\N	https://www.google.com/search?q=CCR%20Fortunate%20Son%20lyrics	https://www.songsterr.com/a/wa/search?pattern=CCR%20Fortunate%20Son	https://www.ultimate-guitar.com/search.php?title=CCR%20Fortunate%20Son&type=300	2026-02-07 14:23:25.425	2026-02-09 15:55:07.207	1990	\N	\N	https://coverartarchive.org/release/731b6edb-8e15-4c99-8e56-5ced5547cc06/front-500	152093	\N	\N	\N
86	Another Saturday Night	Cat Stevens	1500	On The Road To Findout: Greatest Hits (Deluxe Edition)	2025	\N	\N	https://music.youtube.com/search?q=Cat%20Stevens%20Another%20Saturday%20Night	\N	\N	https://www.google.com/search?q=Cat%20Stevens%20Another%20Saturday%20Night%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Cat%20Stevens%20Another%20Saturday%20Night	https://www.ultimate-guitar.com/search.php?title=Cat%20Stevens%20Another%20Saturday%20Night&type=300	2026-02-07 14:05:31.707	2026-02-09 05:10:54.612	2020	\N	\N	https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/e5/74/46/e5744645-906c-3350-2a7e-99c8f1619ddd/25UMGIM95251.rgb.jpg/600x600bb.jpg	155000	\N	\N	\N
85	Every Little Thing	Carlene Carter	1500	Blandat & Klart	2005	\N	\N	https://music.youtube.com/search?q=Carlene%20Carter%20Every%20Little%20Thing	\N	\N	https://www.google.com/search?q=Carlene%20Carter%20Every%20Little%20Thing%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Carlene%20Carter%20Every%20Little%20Thing	https://www.ultimate-guitar.com/search.php?title=Carlene%20Carter%20Every%20Little%20Thing&type=300	2026-02-07 14:04:40.986	2026-02-09 05:10:54.612	2000	\N	country	https://coverartarchive.org/release/4431222a-9d25-4524-9ada-f4bd6b09192a/front-500	198240	\N	\N	\N
89	You Should Probably Leave	Chris Stapleton	1500	Starting Over	2020	\N	\N	https://music.youtube.com/search?q=Chris%20Stapleton%20You%20Should%20Probably%20Leave	\N	\N	https://www.google.com/search?q=Chris%20Stapleton%20You%20Should%20Probably%20Leave%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Chris%20Stapleton%20You%20Should%20Probably%20Leave	https://www.ultimate-guitar.com/search.php?title=Chris%20Stapleton%20You%20Should%20Probably%20Leave&type=300	2026-02-07 14:09:12.387	2026-02-09 05:10:54.612	\N	\N	\N	https://coverartarchive.org/release/49938761-8da8-4acc-b870-cbd2d65636b1/front-500	211000	\N	\N	\N
87	I Want You to Want Me	Cheap Trick	1500	Rock Line: 17 Rockin’ Hits!	1993	\N	\N	https://music.youtube.com/search?q=Cheap%20Trick%20I%20Want%20You%20to%20Want%20Me	\N	\N	https://www.google.com/search?q=Cheap%20Trick%20I%20Want%20You%20to%20Want%20Me%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Cheap%20Trick%20I%20Want%20You%20to%20Want%20Me	https://www.ultimate-guitar.com/search.php?title=Cheap%20Trick%20I%20Want%20You%20to%20Want%20Me&type=300	2026-02-07 14:06:36.479	2026-02-09 05:10:54.612	1990	\N	\N	https://coverartarchive.org/release/e888aeab-84ac-427c-a06f-0dd5e9c301a6/front-500	214106	\N	\N	\N
17	I Hate Myself for Loving You	Joan Jett & The Blackhearts	1515.966091869831	Fit to Be Tied	2009	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-05 05:08:23.257	2026-02-09 15:53:04.576	2000	\N	\N	https://coverartarchive.org/release/878c50a2-5c7f-48c2-9cdb-37ada703890e/front-500	237267	\N	\N	\N
100	Time After Time	Cyndi Lauper	1484	Gold: Greatest Hits	2008	\N	\N	https://music.youtube.com/search?q=Cyndi%20Lauper%20Time%20After%20Time	\N	\N	https://www.google.com/search?q=Cyndi%20Lauper%20Time%20After%20Time%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Cyndi%20Lauper%20Time%20After%20Time	https://www.ultimate-guitar.com/search.php?title=Cyndi%20Lauper%20Time%20After%20Time&type=300	2026-02-07 14:24:31.261	2026-02-09 15:53:48.159	2000	\N	\N	https://coverartarchive.org/release/7c192edf-6072-4506-aa78-f20f6fb44a07/front-500	211186	\N	\N	\N
78	Pink Cadillac	Bruce Springsteen	1516.060631726853	\N	\N	\N	\N	https://music.youtube.com/search?q=Bruce%20Springstein%20Pink%20Cadillac	\N	\N	https://www.google.com/search?q=Bruce%20Springstein%20Pink%20Cadillac%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Bruce%20Springstein%20Pink%20Cadillac	https://www.ultimate-guitar.com/search.php?title=Bruce%20Springstein%20Pink%20Cadillac&type=300	2026-02-07 13:53:48.672	2026-02-09 15:55:27.617	\N	\N	\N	https://coverartarchive.org/release/c2528843-8346-4328-a3ec-cdd91ebee4ba/front-500	\N	\N	\N	\N
92	The World I Know	Collective Soul	1502.136791931508	Live From Morocco	\N	\N	\N	https://music.youtube.com/search?q=Collective%20Soul%20World%20i%20Know	\N	\N	https://www.google.com/search?q=Collective%20Soul%20World%20i%20Know%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Collective%20Soul%20World%20i%20Know	https://www.ultimate-guitar.com/search.php?title=Collective%20Soul%20World%20i%20Know&type=300	2026-02-07 14:12:49.812	2026-02-10 02:25:34.647	\N	\N	rock	https://coverartarchive.org/release/5069cdbc-34c5-4420-b539-f981587abe15/front-500	\N	\N	\N	\N
14	Nobody to Blame	Chris Stapleton	1547.327898381867	Traveller	2015	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-05 05:08:23.252	2026-02-11 00:16:18.277	2010	\N	\N	https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/e2/4b/60/e24b6016-8278-bb18-cf5d-d44bf68371da/00602547223838.rgb.jpg/600x600bb.jpg	274000	E / D	2026-02-11 00:16:18.276	E Standard Tuning  No capo\nDrop D tuning  Capo on 2nd fret
20	Dangerous	Roxette	1530.561226033953	Look Sharp!	1988	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-05 05:08:23.262	2026-02-11 00:46:59.836	\N	\N	\N	https://coverartarchive.org/release/60dffb6d-de80-4a7c-966e-2a71326cf6dc/front-500	230000	\N	2026-02-11 00:46:59.835	\N
32	Roadhouse Blues	The Black Moods	1500	The Black Moods	2021	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-05 05:08:23.278	2026-02-09 05:10:54.612	2020	\N	\N	https://coverartarchive.org/release/3ac8f66a-c2c1-4ed1-b977-0830bbd87ef7/front-500	247819	\N	\N	\N
53	Hold on loosely	.38 Special	1483.331164658214	Best of Classic Rock	1981	\N	\N	https://music.youtube.com/search?q=.38%20Special%20Hold%20on%20loosely	\N	\N	https://www.google.com/search?q=.38%20Special%20Hold%20on%20loosely%20lyrics	https://www.songsterr.com/a/wa/search?pattern=.38%20Special%20Hold%20on%20loosely	https://www.ultimate-guitar.com/search.php?title=.38%20Special%20Hold%20on%20loosely&type=300	2026-02-06 22:46:53.084	2026-02-10 02:25:34.647	1980	\N	\N	https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/33/eb/b6/33ebb64d-8bc8-cd6d-436f-1abe174de272/14UMGIM39488.rgb.jpg/600x600bb.jpg	356000	\N	\N	\N
72	My Kinda Party	Brantley Gilbert	1500	Modern Day Prodigal Son	2009	\N	\N	https://music.youtube.com/search?q=Brantley%20Gilbert%20My%20Kinda%20Party	\N	\N	https://www.google.com/search?q=Brantley%20Gilbert%20My%20Kinda%20Party%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Brantley%20Gilbert%20My%20Kinda%20Party	https://www.ultimate-guitar.com/search.php?title=Brantley%20Gilbert%20My%20Kinda%20Party&type=300	2026-02-07 13:46:02.677	2026-02-09 05:10:54.612	2000	\N	country	https://coverartarchive.org/release/c0222df3-fd1b-42a4-b95c-f4cfebb407e9/front-500	239000	\N	\N	\N
96	Sunshine of Your Love	Cream	1500	BBC Sessions	2003	\N	\N	https://music.youtube.com/search?q=Cream%20Sunshine%20of%20Your%20Love	\N	\N	https://www.google.com/search?q=Cream%20Sunshine%20of%20Your%20Love%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Cream%20Sunshine%20of%20Your%20Love	https://www.ultimate-guitar.com/search.php?title=Cream%20Sunshine%20of%20Your%20Love&type=300	2026-02-07 14:20:21.848	2026-02-09 05:10:54.612	\N	\N	\N	https://coverartarchive.org/release/14e145fa-7b5d-4714-911f-7802cf065b1c/front-500	400893	\N	\N	\N
21	Sold	John Michael Montgomery	1500	Sold	1994	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-05 05:08:23.264	2026-02-09 05:10:54.612	1990	\N	country	https://coverartarchive.org/release/0bc4cdbe-8c25-4b5e-860d-f0c879754124/front-500	152000	\N	\N	\N
69	Lay Your Hands on Me	Bon Jovi	1439.568694251675	1992-10-24: Kaufmann Astoria Studios, New York, NY, USA	1994	\N	\N	https://music.youtube.com/search?q=Bon%20Jovi%20Lay%20Your%20Hands%20on%20Me	\N	\N	https://www.google.com/search?q=Bon%20Jovi%20Lay%20Your%20Hands%20on%20Me%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Bon%20Jovi%20Lay%20Your%20Hands%20on%20Me	https://www.ultimate-guitar.com/search.php?title=Bon%20Jovi%20Lay%20Your%20Hands%20on%20Me&type=300	2026-02-07 13:42:55.806	2026-02-09 15:54:36.038	1990	\N	\N	https://coverartarchive.org/release/a55927ad-2f90-4dc5-a722-a5f6b1ff6bdc/front-500	358000	\N	\N	\N
93	Where The River Flows	Collective Soul	1500	Instant Live: 2005-11-10: Eagles Ballroom, Milwaukee, WI, USA	2005	\N	\N	https://music.youtube.com/search?q=Collective%20Soul%20Where%20The%20River%20Flows	\N	\N	https://www.google.com/search?q=Collective%20Soul%20Where%20The%20River%20Flows%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Collective%20Soul%20Where%20The%20River%20Flows	https://www.ultimate-guitar.com/search.php?title=Collective%20Soul%20Where%20The%20River%20Flows&type=300	2026-02-07 14:13:12.245	2026-02-09 05:10:54.612	2000	\N	\N	https://coverartarchive.org/release/5bfb8a4f-b3ac-4c28-98e5-07d93d7fc97d/front-500	214000	\N	\N	\N
97	Higher	Creed	1468.736306793522	Greatest Hits	1999	\N	\N	https://music.youtube.com/search?q=Creed%20Higher	\N	\N	https://www.google.com/search?q=Creed%20Higher%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Creed%20Higher	https://www.ultimate-guitar.com/search.php?title=Creed%20Higher&type=300	2026-02-07 14:22:21.486	2026-02-09 15:54:42.823	1990	\N	alternative rock	https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/d5/b4/ef/d5b4ef8a-a68f-223b-df91-16294395ffce/00601501410321.rgb.jpg/600x600bb.jpg	320000	\N	\N	\N
13	Whiskey, Women & Wild Rides	Cody M Brooks	1513.838280743712	Whiskey, Women & Wild Rides	2025	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-05 05:08:23.251	2026-02-09 15:55:03.569	2020	\N	\N	https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/ca/d9/02/cad90245-effd-33ff-29bf-683b8a64963c/artwork.jpg/600x600bb.jpg	\N	\N	\N	\N
24	Stacy's Mom	Fountains of Wayne	1500	Old School Bangers	2003	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-05 05:08:23.268	2026-02-09 05:10:54.612	2000	\N	\N	https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/c2/c6/df/c2c6dfb8-11ec-1d8f-2f6b-8d70350e43e5/21UMGIM98135.rgb.jpg/600x600bb.jpg	313120	\N	\N	\N
102	Cinnamon Girl	Neil Young	1530.530498471024	Everybody Knows This Is Nowhere	1969	\N	\N	https://music.youtube.com/search?q=Neil%20Young%20Cinnamon%20Girl	\N	\N	https://www.google.com/search?q=Neil%20Young%20Cinnamon%20Girl%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Neil%20Young%20Cinnamon%20Girl	https://www.ultimate-guitar.com/search.php?title=Neil%20Young%20Cinnamon%20Girl&type=300	2026-02-07 14:26:05.88	2026-02-11 00:50:53.008	1960	\N	\N	https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/86/05/0d/86050dc2-b99f-9e0e-1af5-549d279b7638/093624924739.jpg/600x600bb.jpg	\N	\N	2026-02-11 00:50:53.007	\N
70	Something to Talk About	Bonnie Raitt	1500	Bonnie Raitt and Friends	2006	\N	\N	https://music.youtube.com/search?q=Bonnie%20Raitt%20Something%20to%20Talk%20About	\N	\N	https://www.google.com/search?q=Bonnie%20Raitt%20Something%20to%20Talk%20About%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Bonnie%20Raitt%20Something%20to%20Talk%20About	https://www.ultimate-guitar.com/search.php?title=Bonnie%20Raitt%20Something%20to%20Talk%20About&type=300	2026-02-07 13:44:28.167	2026-02-09 05:10:54.612	2000	\N	blues	https://coverartarchive.org/release/ff55bd22-1f5d-452e-b461-e2c1036209f7/front-500	251266	\N	\N	\N
94	Joey	Concrete Blondes	1500	\N	\N	\N	\N	https://music.youtube.com/search?q=Concrete%20Blondes%20Joey	\N	\N	https://www.google.com/search?q=Concrete%20Blondes%20Joey%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Concrete%20Blondes%20Joey	https://www.ultimate-guitar.com/search.php?title=Concrete%20Blondes%20Joey&type=300	2026-02-07 14:15:22.522	2026-02-09 05:10:54.612	\N	\N	\N	https://coverartarchive.org/release/d2e88bf7-031f-4596-8bc8-8d168fb7d34a/front-500	248959	\N	\N	\N
47	Shake the sugar tree	Pam Tillis	1500	Homeward Looking Angel	1992	\N	\N	https://music.youtube.com/search?q=Pam%20tillis%20Shake%20the%20sugar%20tree	\N	\N	https://www.google.com/search?q=Pam%20tillis%20Shake%20the%20sugar%20tree%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Pam%20tillis%20Shake%20the%20sugar%20tree	https://www.ultimate-guitar.com/search.php?title=Pam%20tillis%20Shake%20the%20sugar%20tree&type=300	2026-02-06 22:37:37.966	2026-02-09 05:10:54.612	1990	\N	\N	https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/e5/92/b8/e592b8bc-c4e9-2c82-8538-3fad43258e4a/mzi.ztexddyd.jpg/600x600bb.jpg	190333	\N	\N	\N
82	Thought I'd Died and Gone to Heaven	Bryan Adams	1500	Live at the Royal Albert Hall	2023	\N	\N	https://music.youtube.com/search?q=Bryan%20Adams%20Thought%20I'd%20Died%20and%20Gone%20to%20Heaven	\N	\N	https://www.google.com/search?q=Bryan%20Adams%20Thought%20I'd%20Died%20and%20Gone%20to%20Heaven%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Bryan%20Adams%20Thought%20I'd%20Died%20and%20Gone%20to%20Heaven	https://www.ultimate-guitar.com/search.php?title=Bryan%20Adams%20Thought%20I'd%20Died%20and%20Gone%20to%20Heaven&type=300	2026-02-07 13:56:39.391	2026-02-09 05:10:54.612	2020	\N	\N	https://coverartarchive.org/release/5903d284-51e0-4bbc-aa12-dd9f23873fe9/front-500	401000	\N	\N	\N
26	The Ballad of Jayne	L.A. Guns	1516	Cocked & Loaded	1989	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-05 05:08:23.27	2026-02-09 15:51:38.844	1980	\N	\N	https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/f3/47/65/f3476560-3340-fc2f-6bdd-68fb366c4c71/00042283859227.rgb.jpg/600x600bb.jpg	316000	\N	\N	\N
81	Somebody	Bryan Adams	1515.300431143147	Straight From the Heart	1991	\N	\N	https://music.youtube.com/search?q=Bryan%20Adams%20Somebody	\N	\N	https://www.google.com/search?q=Bryan%20Adams%20Somebody%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Bryan%20Adams%20Somebody	https://www.ultimate-guitar.com/search.php?title=Bryan%20Adams%20Somebody&type=300	2026-02-07 13:55:56.614	2026-02-10 02:25:29.527	2000	\N	\N	https://coverartarchive.org/release/ee5ac440-8368-4fdb-90ba-1fc7de10108f/front-500	276853	\N	\N	\N
63	Three Little Birds	Bob Marley	1516	Bob Marley: The 420 Edition	\N	\N	\N	https://music.youtube.com/search?q=Bob%20Marley%20Three%20Little%20Birds	\N	\N	https://www.google.com/search?q=Bob%20Marley%20Three%20Little%20Birds%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Bob%20Marley%20Three%20Little%20Birds	https://www.ultimate-guitar.com/search.php?title=Bob%20Marley%20Three%20Little%20Birds&type=300	2026-02-07 13:37:04.908	2026-02-09 15:53:48.159	\N	\N	\N	https://coverartarchive.org/release/96ed7dc7-5fa2-4875-b8c2-7a516b5d0d03/front-500	72000	\N	\N	\N
76	Cadillac Ranch	Bruce Springsteen	1515.263693206478	\N	\N	\N	\N	https://music.youtube.com/search?q=Bruce%20Springstein%20Cadillac%20Ranch	\N	\N	https://www.google.com/search?q=Bruce%20Springstein%20Cadillac%20Ranch%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Bruce%20Springstein%20Cadillac%20Ranch	https://www.ultimate-guitar.com/search.php?title=Bruce%20Springstein%20Cadillac%20Ranch&type=300	2026-02-07 13:52:11.986	2026-02-09 15:54:42.823	\N	\N	\N	https://coverartarchive.org/release/554b2bc1-686a-425a-8cf4-27e340d4d234/front-500	183973	\N	\N	\N
88	The Flame	Cheap Trick	1516	The Essential Cheap Trick	1988	\N	\N	https://music.youtube.com/search?q=Cheap%20Trick%20The%20Flame	\N	\N	https://www.google.com/search?q=Cheap%20Trick%20The%20Flame%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Cheap%20Trick%20The%20Flame	https://www.ultimate-guitar.com/search.php?title=Cheap%20Trick%20The%20Flame&type=300	2026-02-07 14:06:56.781	2026-02-09 15:54:18.16	1980	\N	\N	https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/1a/01/08/1a010844-9cde-9195-32e3-c17d043dec16/dj.mzmirbki.jpg/600x600bb.jpg	280800	\N	\N	\N
50	Every Once in a While	Blackhawk	1531.2654784203	Greatest Hits	1993	\N	\N	https://music.youtube.com/search?q=Blackhawk%20Every%20Once%20in%20a%20While	\N	\N	https://www.google.com/search?q=Blackhawk%20Every%20Once%20in%20a%20While%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Blackhawk%20Every%20Once%20in%20a%20While	https://www.ultimate-guitar.com/search.php?title=Blackhawk%20Every%20Once%20in%20a%20While&type=300	2026-02-06 22:41:01.251	2026-02-11 00:38:12.721	1990	\N	\N	https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/3a/ab/7d/3aab7d41-f9a3-36c8-3d25-15a5d3801715/078221890724.jpg/600x600bb.jpg	221000	\N	2026-02-11 00:38:12.72	\N
43	Watermelon Moonshine	Lainey Wilson	1484	Bell Bottom Country	\N	\N	\N	https://music.youtube.com/search?q=Lainey%20Wilson%20Watermelon%20Moonshine	\N	\N	https://www.google.com/search?q=Lainey%20Wilson%20Watermelon%20Moonshine%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Lainey%20Wilson%20Watermelon%20Moonshine	https://www.ultimate-guitar.com/search.php?title=Lainey%20Wilson%20Watermelon%20Moonshine&type=300	2026-02-06 22:22:09.618	2026-02-09 15:55:16.087	\N	\N	\N	https://coverartarchive.org/release/fb27de3d-0647-4cfc-a3aa-f76ec210e559/front-500	209000	\N	\N	\N
98	My Sacrifice	Creed	1469.406489706646	Greatest Hits	2001	\N	\N	https://music.youtube.com/search?q=Creed%20My%20Sacrifice	\N	\N	https://www.google.com/search?q=Creed%20My%20Sacrifice%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Creed%20My%20Sacrifice	https://www.ultimate-guitar.com/search.php?title=Creed%20My%20Sacrifice&type=300	2026-02-07 14:22:38.828	2026-02-09 15:55:31.939	2000	\N	\N	https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/d5/b4/ef/d5b4ef8a-a68f-223b-df91-16294395ffce/00601501410321.rgb.jpg/600x600bb.jpg	275973	\N	\N	\N
59	Must Be Doing Something Right	Billy Currington	1480.630263430501	\N	\N	\N	\N	https://music.youtube.com/search?q=Billy%20Currington%20Must%20Be%20Doing%20Something%20Right	\N	\N	https://www.google.com/search?q=Billy%20Currington%20Must%20Be%20Doing%20Something%20Right%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Billy%20Currington%20Must%20Be%20Doing%20Something%20Right	https://www.ultimate-guitar.com/search.php?title=Billy%20Currington%20Must%20Be%20Doing%20Something%20Right&type=300	2026-02-07 02:21:56.877	2026-02-14 00:46:57.278	\N	\N	\N	\N	\N	\N	\N	\N
48	I sure can smell the rain	Blackhawk	1515.263693206478	Blackhawk	1993	\N	\N	https://music.youtube.com/search?q=Blackhawk%20I%20sure%20can%20smell%20the%20rain	\N	\N	https://www.google.com/search?q=Blackhawk%20I%20sure%20can%20smell%20the%20rain%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Blackhawk%20I%20sure%20can%20smell%20the%20rain	https://www.ultimate-guitar.com/search.php?title=Blackhawk%20I%20sure%20can%20smell%20the%20rain&type=300	2026-02-06 22:38:38.713	2026-02-09 15:53:00.379	1990	\N	\N	https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/fc/90/8c/fc908cc9-d809-27c1-f170-9e32b21d5ca5/886445786231.jpg/600x600bb.jpg	215266	\N	\N	\N
68	You'll Accompany Me	Bob Seger	1516	\N	\N	\N	\N	https://music.youtube.com/search?q=Bob%20Seger%20You'll%20Accompany%20Me	\N	\N	https://www.google.com/search?q=Bob%20Seger%20You'll%20Accompany%20Me%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Bob%20Seger%20You'll%20Accompany%20Me	https://www.ultimate-guitar.com/search.php?title=Bob%20Seger%20You'll%20Accompany%20Me&type=300	2026-02-07 13:41:20.345	2026-02-09 15:55:19.854	\N	\N	\N	\N	\N	\N	\N	\N
41	Don't do me like that	Tom Petty	1513.216313081086	Broadcast Collection '77-'93	2017	\N	\N	https://music.youtube.com/search?q=Tom%20Petty%20Don't%20do%20me%20like%20that	\N	\N	https://www.google.com/search?q=Tom%20Petty%20Don't%20do%20me%20like%20that%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Tom%20Petty%20Don't%20do%20me%20like%20that	https://www.ultimate-guitar.com/search.php?title=Tom%20Petty%20Don't%20do%20me%20like%20that&type=300	2026-02-06 22:11:55.264	2026-02-09 15:55:22.693	2010	\N	\N	https://coverartarchive.org/release/e4949810-b5ad-4f72-92d8-369634eb56fd/front-500	351479	\N	\N	\N
95	She Never Cried	Confederate Railroad	1483.263693206478	Confederate Classics	2019	\N	\N	https://music.youtube.com/search?q=Confederate%20Railroad%20She%20Never%20Cried	\N	\N	https://www.google.com/search?q=Confederate%20Railroad%20She%20Never%20Cried%20lyrics	https://www.songsterr.com/a/wa/search?pattern=Confederate%20Railroad%20She%20Never%20Cried	https://www.ultimate-guitar.com/search.php?title=Confederate%20Railroad%20She%20Never%20Cried&type=300	2026-02-07 14:19:19.419	2026-02-14 00:46:45.376	1990	\N	country	https://coverartarchive.org/release/8733b7cf-a471-49d8-8fcb-b7e0730f3937/front-500	205426	\N	\N	\N
\.


--
-- Data for Name: SongReadiness; Type: TABLE DATA; Schema: public; Owner: mixtape
--

COPY public."SongReadiness" (id, "songId", "userId", status, "createdAt", "updatedAt") FROM stdin;
1	11	cml8zmoj10000lq01dsv92r8r	SOLID	2026-02-09 05:10:28.165	2026-02-09 05:10:28.165
2	25	cml8zmoj10000lq01dsv92r8r	NOT_READY	2026-02-09 05:22:07.28	2026-02-09 05:22:19.975
4	14	cml9xqamk0000p501dc0idtmt	NOT_READY	2026-02-09 18:42:41.317	2026-02-09 18:42:41.317
5	14	cml8zmoj10000lq01dsv92r8r	NEEDS_WORK	2026-02-10 01:37:39.797	2026-02-10 01:37:39.797
6	1	cml9xqamk0000p501dc0idtmt	NEEDS_WORK	2026-02-10 13:54:38.883	2026-02-10 13:54:38.883
7	53	cml8zmoj10000lq01dsv92r8r	NEEDS_WORK	2026-02-12 03:23:00.619	2026-02-14 00:46:06.391
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: mixtape
--

COPY public."User" (id, name, email, password, "emailVerified", image, "isAdmin") FROM stdin;
cml9xqamk0000p501dc0idtmt	\N	hank.king2018@gmail.com	$2b$10$p5hOaBRrmbe0ncZW8Oc74uLBWhwcQun9LJ.MYhDH7drnkMQHsHwYO	\N	\N	t
cml8zmoj10000lq01dsv92r8r	\N	tim@levesques.net	$2b$10$TAabzqf5.NBlev00EBt./OpTwGfusH1Bbvd5H3OEAhqzF/2bHrTjC	2026-02-05 05:00:13.357	\N	t
cmlckbbrk0000rt01wrjmooxv	\N	nicoledyer331@yahoo.com	$2b$10$SLmt2TcwzkfPTUsUtfA7ge2hgsubzJDayNcVJ8TdFVrd9vuOvfFHK	\N	\N	f
cmld1c7ig000imi01uf7ikzgc	\N	nicoleadams828@gmail.com	$2b$10$CizoPVR0ShmDu9a30fQAsePt6iMe2F3PwEtzgdgGEcJOfpF7uiXkS	\N	\N	f
\.


--
-- Data for Name: UserPreference; Type: TABLE DATA; Schema: public; Owner: mixtape
--

COPY public."UserPreference" (id, "userId", genres, decades, artists, "energyMoods", "excludedSongIds", "createdAt", "updatedAt") FROM stdin;
cmlllpaxl0007mg01x3vb9vt8	cml8zmoj10000lq01dsv92r8r	{"alternative rock",blues,"hard rock",punk,rock,pop,"folk rock"}	{1970,1990,2000}	{}	{}	{}	2026-02-14 00:51:21.37	2026-02-14 00:51:21.37
\.


--
-- Data for Name: VerificationToken; Type: TABLE DATA; Schema: public; Owner: mixtape
--

COPY public."VerificationToken" (identifier, token, expires) FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: mixtape
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
df7d4842-3527-4a9f-a920-e67cdac1fc2a	00ecb9555ecafdb0b1d86edfc3eee2d7775ea16db7e1ac3d00690c598beabfe6	2026-02-05 16:42:20.318276+00	20260204025345_init		\N	2026-02-05 16:42:20.318276+00	0
fbf90b5a-5c78-4b21-8379-2d73d2b9f354	7aa509de0ca4ce901cef21f6ddd3d48d5cee4c0b26aa7241065416098fd1c537	2026-02-05 16:42:21.100304+00	20260204034218_add_auth_models		\N	2026-02-05 16:42:21.100304+00	0
381dc094-f706-431a-9542-41aa96c2271b	2fe367cd13a90e64c0acd421ef538908c8b072689c79bd2dcdbb37b201e4c21c	2026-02-05 16:42:21.87543+00	20260204040817_add_song_resources		\N	2026-02-05 16:42:21.87543+00	0
de794e5c-2efd-4bb5-99a1-cd0ffddcafb3	30d85ad090d0a60c9408698e12c41e8ca3456c17fd157c809b04b7065518c3d1	2026-02-05 16:42:22.707527+00	20260204045024_add_password_field		\N	2026-02-05 16:42:22.707527+00	0
2e49ee86-2f67-47f3-82ea-85406f927c9e	93c0b3f7e5d34a8fbf95e4f1a8f2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0	2026-02-07 21:41:07.431518+00	20260207163424_add_album_art_and_metadata		\N	2026-02-07 21:41:07.431518+00	1
1e7b7150-ad07-4412-ad70-f9b9e92249c2	7d5b3aebf4e65bbffbe4e0c0d72c56ecb7be0a95a95cc33403c1eaecb97ec10c	\N	20260205162607_add_invite_model	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260205162607_add_invite_model\n\nDatabase error code: 42601\n\nDatabase error:\nERROR: syntax error at or near "PRAGMA"\n\nPosition:\n[1m 18[0m     "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,\n[1m 19[0m     CONSTRAINT "Invite_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE\n[1m 20[0m );\n[1m 21[0m\n[1m 22[0m -- RedefineTables\n[1m 23[1;31m PRAGMA foreign_keys=OFF;[0m\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42601), message: "syntax error at or near \\"PRAGMA\\"", detail: None, hint: None, position: Some(Original(907)), where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("scan.l"), line: Some(1244), routine: Some("scanner_yyerror") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20260205162607_add_invite_model"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:106\n   1: schema_core::commands::apply_migrations::Applying migration\n           with migration_name="20260205162607_add_invite_model"\n             at schema-engine\\core\\src\\commands\\apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:197	2026-02-09 05:09:34.996334+00	2026-02-05 16:42:23.500816+00	0
51006cfc-22af-4c57-96b8-df56d4bef3b9	0fe65426c611a74f46d622d8a84282d92f2d322f7da3fade688c70459f0a3e0b	2026-02-09 05:09:39.06092+00	20260208233300_add_song_readiness_and_practice	\N	\N	2026-02-09 05:09:39.024871+00	1
\.


--
-- Name: BattleVote_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mixtape
--

SELECT pg_catalog.setval('public."BattleVote_id_seq"', 307, true);


--
-- Name: Comment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mixtape
--

SELECT pg_catalog.setval('public."Comment_id_seq"', 1, false);


--
-- Name: SongReadiness_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mixtape
--

SELECT pg_catalog.setval('public."SongReadiness_id_seq"', 11, true);


--
-- Name: Song_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mixtape
--

SELECT pg_catalog.setval('public."Song_id_seq"', 106, true);


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: mixtape
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: BattlePairingHistory BattlePairingHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: mixtape
--

ALTER TABLE ONLY public."BattlePairingHistory"
    ADD CONSTRAINT "BattlePairingHistory_pkey" PRIMARY KEY (id);


--
-- Name: BattleSkip BattleSkip_pkey; Type: CONSTRAINT; Schema: public; Owner: mixtape
--

ALTER TABLE ONLY public."BattleSkip"
    ADD CONSTRAINT "BattleSkip_pkey" PRIMARY KEY (id);


--
-- Name: BattleVote BattleVote_pkey; Type: CONSTRAINT; Schema: public; Owner: mixtape
--

ALTER TABLE ONLY public."BattleVote"
    ADD CONSTRAINT "BattleVote_pkey" PRIMARY KEY (id);


--
-- Name: Comment Comment_pkey; Type: CONSTRAINT; Schema: public; Owner: mixtape
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_pkey" PRIMARY KEY (id);


--
-- Name: Invite Invite_pkey; Type: CONSTRAINT; Schema: public; Owner: mixtape
--

ALTER TABLE ONLY public."Invite"
    ADD CONSTRAINT "Invite_pkey" PRIMARY KEY (id);


--
-- Name: Invite Invite_token_key; Type: CONSTRAINT; Schema: public; Owner: mixtape
--

ALTER TABLE ONLY public."Invite"
    ADD CONSTRAINT "Invite_token_key" UNIQUE (token);


--
-- Name: PasswordReset PasswordReset_pkey; Type: CONSTRAINT; Schema: public; Owner: mixtape
--

ALTER TABLE ONLY public."PasswordReset"
    ADD CONSTRAINT "PasswordReset_pkey" PRIMARY KEY (id);


--
-- Name: PasswordReset PasswordReset_token_key; Type: CONSTRAINT; Schema: public; Owner: mixtape
--

ALTER TABLE ONLY public."PasswordReset"
    ADD CONSTRAINT "PasswordReset_token_key" UNIQUE (token);


--
-- Name: PracticeListItem PracticeListItem_pkey; Type: CONSTRAINT; Schema: public; Owner: mixtape
--

ALTER TABLE ONLY public."PracticeListItem"
    ADD CONSTRAINT "PracticeListItem_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: mixtape
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_sessionToken_key; Type: CONSTRAINT; Schema: public; Owner: mixtape
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_sessionToken_key" UNIQUE ("sessionToken");


--
-- Name: SongReadiness SongReadiness_pkey; Type: CONSTRAINT; Schema: public; Owner: mixtape
--

ALTER TABLE ONLY public."SongReadiness"
    ADD CONSTRAINT "SongReadiness_pkey" PRIMARY KEY (id);


--
-- Name: Song Song_pkey; Type: CONSTRAINT; Schema: public; Owner: mixtape
--

ALTER TABLE ONLY public."Song"
    ADD CONSTRAINT "Song_pkey" PRIMARY KEY (id);


--
-- Name: UserPreference UserPreference_pkey; Type: CONSTRAINT; Schema: public; Owner: mixtape
--

ALTER TABLE ONLY public."UserPreference"
    ADD CONSTRAINT "UserPreference_pkey" PRIMARY KEY (id);


--
-- Name: User User_email_key; Type: CONSTRAINT; Schema: public; Owner: mixtape
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_email_key" UNIQUE (email);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: mixtape
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: mixtape
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Account_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: mixtape
--

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON public."Account" USING btree (provider, "providerAccountId");


--
-- Name: BattlePairingHistory_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: mixtape
--

CREATE INDEX "BattlePairingHistory_userId_createdAt_idx" ON public."BattlePairingHistory" USING btree ("userId", "createdAt");


--
-- Name: BattlePairingHistory_userId_songAId_songBId_key; Type: INDEX; Schema: public; Owner: mixtape
--

CREATE UNIQUE INDEX "BattlePairingHistory_userId_songAId_songBId_key" ON public."BattlePairingHistory" USING btree ("userId", "songAId", "songBId");


--
-- Name: BattleSkip_userId_lastSkippedAt_idx; Type: INDEX; Schema: public; Owner: mixtape
--

CREATE INDEX "BattleSkip_userId_lastSkippedAt_idx" ON public."BattleSkip" USING btree ("userId", "lastSkippedAt");


--
-- Name: BattleSkip_userId_songId_key; Type: INDEX; Schema: public; Owner: mixtape
--

CREATE UNIQUE INDEX "BattleSkip_userId_songId_key" ON public."BattleSkip" USING btree ("userId", "songId");


--
-- Name: BattleVote_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: mixtape
--

CREATE INDEX "BattleVote_userId_createdAt_idx" ON public."BattleVote" USING btree ("userId", "createdAt");


--
-- Name: BattleVote_userId_songA_songB_createdAt_idx; Type: INDEX; Schema: public; Owner: mixtape
--

CREATE INDEX "BattleVote_userId_songA_songB_createdAt_idx" ON public."BattleVote" USING btree ("userId", "songA", "songB", "createdAt");


--
-- Name: Comment_songId_createdAt_idx; Type: INDEX; Schema: public; Owner: mixtape
--

CREATE INDEX "Comment_songId_createdAt_idx" ON public."Comment" USING btree ("songId", "createdAt");


--
-- Name: Comment_userId_idx; Type: INDEX; Schema: public; Owner: mixtape
--

CREATE INDEX "Comment_userId_idx" ON public."Comment" USING btree ("userId");


--
-- Name: PracticeListItem_userId_priority_idx; Type: INDEX; Schema: public; Owner: mixtape
--

CREATE INDEX "PracticeListItem_userId_priority_idx" ON public."PracticeListItem" USING btree ("userId", priority);


--
-- Name: PracticeListItem_userId_songId_key; Type: INDEX; Schema: public; Owner: mixtape
--

CREATE UNIQUE INDEX "PracticeListItem_userId_songId_key" ON public."PracticeListItem" USING btree ("userId", "songId");


--
-- Name: PracticeListItem_userId_status_idx; Type: INDEX; Schema: public; Owner: mixtape
--

CREATE INDEX "PracticeListItem_userId_status_idx" ON public."PracticeListItem" USING btree ("userId", status);


--
-- Name: SongReadiness_songId_idx; Type: INDEX; Schema: public; Owner: mixtape
--

CREATE INDEX "SongReadiness_songId_idx" ON public."SongReadiness" USING btree ("songId");


--
-- Name: SongReadiness_songId_userId_key; Type: INDEX; Schema: public; Owner: mixtape
--

CREATE UNIQUE INDEX "SongReadiness_songId_userId_key" ON public."SongReadiness" USING btree ("songId", "userId");


--
-- Name: SongReadiness_userId_idx; Type: INDEX; Schema: public; Owner: mixtape
--

CREATE INDEX "SongReadiness_userId_idx" ON public."SongReadiness" USING btree ("userId");


--
-- Name: UserPreference_userId_key; Type: INDEX; Schema: public; Owner: mixtape
--

CREATE UNIQUE INDEX "UserPreference_userId_key" ON public."UserPreference" USING btree ("userId");


--
-- Name: VerificationToken_identifier_token_key; Type: INDEX; Schema: public; Owner: mixtape
--

CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON public."VerificationToken" USING btree (identifier, token);


--
-- Name: VerificationToken_token_key; Type: INDEX; Schema: public; Owner: mixtape
--

CREATE UNIQUE INDEX "VerificationToken_token_key" ON public."VerificationToken" USING btree (token);


--
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mixtape
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BattlePairingHistory BattlePairingHistory_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mixtape
--

ALTER TABLE ONLY public."BattlePairingHistory"
    ADD CONSTRAINT "BattlePairingHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BattleSkip BattleSkip_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mixtape
--

ALTER TABLE ONLY public."BattleSkip"
    ADD CONSTRAINT "BattleSkip_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BattleVote BattleVote_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mixtape
--

ALTER TABLE ONLY public."BattleVote"
    ADD CONSTRAINT "BattleVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Comment Comment_songId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mixtape
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_songId_fkey" FOREIGN KEY ("songId") REFERENCES public."Song"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Comment Comment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mixtape
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Invite Invite_invitedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mixtape
--

ALTER TABLE ONLY public."Invite"
    ADD CONSTRAINT "Invite_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PracticeListItem PracticeListItem_songId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mixtape
--

ALTER TABLE ONLY public."PracticeListItem"
    ADD CONSTRAINT "PracticeListItem_songId_fkey" FOREIGN KEY ("songId") REFERENCES public."Song"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PracticeListItem PracticeListItem_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mixtape
--

ALTER TABLE ONLY public."PracticeListItem"
    ADD CONSTRAINT "PracticeListItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mixtape
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SongReadiness SongReadiness_songId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mixtape
--

ALTER TABLE ONLY public."SongReadiness"
    ADD CONSTRAINT "SongReadiness_songId_fkey" FOREIGN KEY ("songId") REFERENCES public."Song"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SongReadiness SongReadiness_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mixtape
--

ALTER TABLE ONLY public."SongReadiness"
    ADD CONSTRAINT "SongReadiness_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserPreference UserPreference_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mixtape
--

ALTER TABLE ONLY public."UserPreference"
    ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict nkyXdODKVt69T6yDl7vYE1xBu6k1FyNeLSBUGCbJjJwflW7Wyg2k5gddyKzvh0X

