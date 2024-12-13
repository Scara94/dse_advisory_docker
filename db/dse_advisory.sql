--
-- PostgreSQL database dump
--

-- Dumped from database version 16.6 (Postgres.app)
-- Dumped by pg_dump version 17.0

-- Started on 2024-12-02 19:55:54 CET

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5 (class 2615 OID 16392)
-- Name: dse_advisory; Type: SCHEMA; Schema: -; Owner: admin
--

CREATE SCHEMA dse_advisory;


ALTER SCHEMA dse_advisory OWNER TO admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 216 (class 1259 OID 16402)
-- Name: cohort; Type: TABLE; Schema: dse_advisory; Owner: postgres
--

CREATE TABLE dse_advisory.cohort (
    id integer NOT NULL,
    name character varying(10)
);


ALTER TABLE dse_advisory.cohort OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 16401)
-- Name: cohort_id_seq; Type: SEQUENCE; Schema: dse_advisory; Owner: postgres
--

CREATE SEQUENCE dse_advisory.cohort_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE dse_advisory.cohort_id_seq OWNER TO postgres;

--
-- TOC entry 3745 (class 0 OID 0)
-- Dependencies: 215
-- Name: cohort_id_seq; Type: SEQUENCE OWNED BY; Schema: dse_advisory; Owner: postgres
--

ALTER SEQUENCE dse_advisory.cohort_id_seq OWNED BY dse_advisory.cohort.id;


--
-- TOC entry 219 (class 1259 OID 16443)
-- Name: coordinator; Type: TABLE; Schema: dse_advisory; Owner: postgres
--

CREATE TABLE dse_advisory.coordinator (
    username character varying(50) NOT NULL,
    password character varying(255),
    firstname character varying(30),
    lastname character varying(30),
    is_active boolean DEFAULT true,
    salt character varying(255)
);


ALTER TABLE dse_advisory.coordinator OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16478)
-- Name: document; Type: TABLE; Schema: dse_advisory; Owner: postgres
--

CREATE TABLE dse_advisory.document (
    id integer NOT NULL,
    link text,
    description text,
    upload_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_deleted boolean
);


ALTER TABLE dse_advisory.document OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16477)
-- Name: document_id_seq; Type: SEQUENCE; Schema: dse_advisory; Owner: postgres
--

CREATE SEQUENCE dse_advisory.document_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE dse_advisory.document_id_seq OWNER TO postgres;

--
-- TOC entry 3746 (class 0 OID 0)
-- Dependencies: 225
-- Name: document_id_seq; Type: SEQUENCE OWNED BY; Schema: dse_advisory; Owner: postgres
--

ALTER SEQUENCE dse_advisory.document_id_seq OWNED BY dse_advisory.document.id;


--
-- TOC entry 221 (class 1259 OID 16449)
-- Name: news; Type: TABLE; Schema: dse_advisory; Owner: postgres
--

CREATE TABLE dse_advisory.news (
    id integer NOT NULL,
    subject character varying(50),
    content text,
    is_deleted boolean DEFAULT false,
    publication_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    expiration_date date
);


ALTER TABLE dse_advisory.news OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 16824)
-- Name: news_doc; Type: TABLE; Schema: dse_advisory; Owner: postgres
--

CREATE TABLE dse_advisory.news_doc (
    news_id integer NOT NULL,
    document_id integer NOT NULL
);


ALTER TABLE dse_advisory.news_doc OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16448)
-- Name: news_id_seq; Type: SEQUENCE; Schema: dse_advisory; Owner: postgres
--

CREATE SEQUENCE dse_advisory.news_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE dse_advisory.news_id_seq OWNER TO postgres;

--
-- TOC entry 3747 (class 0 OID 0)
-- Dependencies: 220
-- Name: news_id_seq; Type: SEQUENCE OWNED BY; Schema: dse_advisory; Owner: postgres
--

ALTER SEQUENCE dse_advisory.news_id_seq OWNED BY dse_advisory.news.id;


--
-- TOC entry 224 (class 1259 OID 16460)
-- Name: news_target; Type: TABLE; Schema: dse_advisory; Owner: postgres
--

CREATE TABLE dse_advisory.news_target (
    cohort_id integer NOT NULL,
    news_id integer NOT NULL
);


ALTER TABLE dse_advisory.news_target OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16458)
-- Name: news_target_cohort_id_seq; Type: SEQUENCE; Schema: dse_advisory; Owner: postgres
--

CREATE SEQUENCE dse_advisory.news_target_cohort_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE dse_advisory.news_target_cohort_id_seq OWNER TO postgres;

--
-- TOC entry 3748 (class 0 OID 0)
-- Dependencies: 222
-- Name: news_target_cohort_id_seq; Type: SEQUENCE OWNED BY; Schema: dse_advisory; Owner: postgres
--

ALTER SEQUENCE dse_advisory.news_target_cohort_id_seq OWNED BY dse_advisory.news_target.cohort_id;


--
-- TOC entry 223 (class 1259 OID 16459)
-- Name: news_target_news_id_seq; Type: SEQUENCE; Schema: dse_advisory; Owner: postgres
--

CREATE SEQUENCE dse_advisory.news_target_news_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE dse_advisory.news_target_news_id_seq OWNER TO postgres;

--
-- TOC entry 3749 (class 0 OID 0)
-- Dependencies: 223
-- Name: news_target_news_id_seq; Type: SEQUENCE OWNED BY; Schema: dse_advisory; Owner: postgres
--

ALTER SEQUENCE dse_advisory.news_target_news_id_seq OWNED BY dse_advisory.news_target.news_id;


--
-- TOC entry 236 (class 1259 OID 16695)
-- Name: staging; Type: TABLE; Schema: dse_advisory; Owner: postgres
--

CREATE TABLE dse_advisory.staging (
    username character varying(50) NOT NULL,
    token character varying(255),
    user_type text
);


ALTER TABLE dse_advisory.staging OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16428)
-- Name: student; Type: TABLE; Schema: dse_advisory; Owner: postgres
--

CREATE TABLE dse_advisory.student (
    serial_id character varying(10) NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(255),
    firstname character varying(30),
    lastname character varying(30),
    is_active boolean DEFAULT true,
    cohort_id integer,
    salt character varying(255)
);


ALTER TABLE dse_advisory.student OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16438)
-- Name: teacher; Type: TABLE; Schema: dse_advisory; Owner: postgres
--

CREATE TABLE dse_advisory.teacher (
    username character varying(50) NOT NULL,
    password character varying(255),
    firstname character varying(30),
    lastname character varying(30),
    is_active boolean DEFAULT true,
    institution character varying(50),
    salt character varying(255)
);


ALTER TABLE dse_advisory.teacher OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16571)
-- Name: thesis; Type: TABLE; Schema: dse_advisory; Owner: postgres
--

CREATE TABLE dse_advisory.thesis (
    id integer NOT NULL,
    assignmentdate date,
    discussiondate date,
    is_deleted boolean DEFAULT false,
    title character varying(50),
    student_username character varying(50),
    supervisor character varying(50),
    co_supervisor character varying(50)
);


ALTER TABLE dse_advisory.thesis OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16594)
-- Name: thesis_doc; Type: TABLE; Schema: dse_advisory; Owner: postgres
--

CREATE TABLE dse_advisory.thesis_doc (
    document_id integer NOT NULL,
    thesis_id integer NOT NULL
);


ALTER TABLE dse_advisory.thesis_doc OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16592)
-- Name: thesis_doc_document_id_seq; Type: SEQUENCE; Schema: dse_advisory; Owner: postgres
--

CREATE SEQUENCE dse_advisory.thesis_doc_document_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE dse_advisory.thesis_doc_document_id_seq OWNER TO postgres;

--
-- TOC entry 3750 (class 0 OID 0)
-- Dependencies: 229
-- Name: thesis_doc_document_id_seq; Type: SEQUENCE OWNED BY; Schema: dse_advisory; Owner: postgres
--

ALTER SEQUENCE dse_advisory.thesis_doc_document_id_seq OWNED BY dse_advisory.thesis_doc.document_id;


--
-- TOC entry 230 (class 1259 OID 16593)
-- Name: thesis_doc_thesis_id_seq; Type: SEQUENCE; Schema: dse_advisory; Owner: postgres
--

CREATE SEQUENCE dse_advisory.thesis_doc_thesis_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE dse_advisory.thesis_doc_thesis_id_seq OWNER TO postgres;

--
-- TOC entry 3751 (class 0 OID 0)
-- Dependencies: 230
-- Name: thesis_doc_thesis_id_seq; Type: SEQUENCE OWNED BY; Schema: dse_advisory; Owner: postgres
--

ALTER SEQUENCE dse_advisory.thesis_doc_thesis_id_seq OWNED BY dse_advisory.thesis_doc.thesis_id;


--
-- TOC entry 227 (class 1259 OID 16570)
-- Name: thesis_id_seq; Type: SEQUENCE; Schema: dse_advisory; Owner: postgres
--

CREATE SEQUENCE dse_advisory.thesis_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE dse_advisory.thesis_id_seq OWNER TO postgres;

--
-- TOC entry 3752 (class 0 OID 0)
-- Dependencies: 227
-- Name: thesis_id_seq; Type: SEQUENCE OWNED BY; Schema: dse_advisory; Owner: postgres
--

ALTER SEQUENCE dse_advisory.thesis_id_seq OWNED BY dse_advisory.thesis.id;


--
-- TOC entry 234 (class 1259 OID 16613)
-- Name: thesis_proposal; Type: TABLE; Schema: dse_advisory; Owner: postgres
--

CREATE TABLE dse_advisory.thesis_proposal (
    id integer NOT NULL,
    title character varying(50),
    description text,
    is_deleted boolean DEFAULT false,
    keys character varying(100),
    duration integer,
    expiration date,
    thesis_id integer,
    teacher character varying(50)
);


ALTER TABLE dse_advisory.thesis_proposal OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 16611)
-- Name: thesis_proposal_id_seq; Type: SEQUENCE; Schema: dse_advisory; Owner: postgres
--

CREATE SEQUENCE dse_advisory.thesis_proposal_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE dse_advisory.thesis_proposal_id_seq OWNER TO postgres;

--
-- TOC entry 3753 (class 0 OID 0)
-- Dependencies: 232
-- Name: thesis_proposal_id_seq; Type: SEQUENCE OWNED BY; Schema: dse_advisory; Owner: postgres
--

ALTER SEQUENCE dse_advisory.thesis_proposal_id_seq OWNED BY dse_advisory.thesis_proposal.id;


--
-- TOC entry 233 (class 1259 OID 16612)
-- Name: thesis_proposal_thesis_id_seq; Type: SEQUENCE; Schema: dse_advisory; Owner: postgres
--

CREATE SEQUENCE dse_advisory.thesis_proposal_thesis_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE dse_advisory.thesis_proposal_thesis_id_seq OWNER TO postgres;

--
-- TOC entry 3754 (class 0 OID 0)
-- Dependencies: 233
-- Name: thesis_proposal_thesis_id_seq; Type: SEQUENCE OWNED BY; Schema: dse_advisory; Owner: postgres
--

ALTER SEQUENCE dse_advisory.thesis_proposal_thesis_id_seq OWNED BY dse_advisory.thesis_proposal.thesis_id;


--
-- TOC entry 235 (class 1259 OID 16678)
-- Name: user_login_credentials; Type: VIEW; Schema: dse_advisory; Owner: postgres
--

CREATE VIEW dse_advisory.user_login_credentials AS
 WITH prioritized_users AS (
         SELECT coordinator.username,
            coordinator.firstname,
            coordinator.lastname,
            coordinator.password,
            coordinator.salt,
            coordinator.is_active,
            'coordinator'::text AS user_type,
            1 AS priority
           FROM dse_advisory.coordinator
        UNION ALL
         SELECT teacher.username,
            teacher.firstname,
            teacher.lastname,
            teacher.password,
            teacher.salt,
            teacher.is_active,
            'teacher'::text AS user_type,
            2 AS priority
           FROM dse_advisory.teacher
        UNION ALL
         SELECT student.username,
            student.firstname,
            student.lastname,
            student.password,
            student.salt,
            student.is_active,
            'student'::text AS user_type,
            3 AS priority
           FROM dse_advisory.student
        ), unique_users AS (
         SELECT DISTINCT ON (prioritized_users.username) prioritized_users.username,
            prioritized_users.firstname,
            prioritized_users.lastname,
            prioritized_users.password,
            prioritized_users.salt,
            prioritized_users.is_active,
            prioritized_users.user_type
           FROM prioritized_users
          ORDER BY prioritized_users.username, prioritized_users.priority
        )
 SELECT username,
    firstname,
    lastname,
    password,
    salt,
    is_active,
    user_type
   FROM unique_users;


ALTER VIEW dse_advisory.user_login_credentials OWNER TO postgres;

--
-- TOC entry 3522 (class 2604 OID 16405)
-- Name: cohort id; Type: DEFAULT; Schema: dse_advisory; Owner: postgres
--

ALTER TABLE ONLY dse_advisory.cohort ALTER COLUMN id SET DEFAULT nextval('dse_advisory.cohort_id_seq'::regclass);


--
-- TOC entry 3531 (class 2604 OID 16481)
-- Name: document id; Type: DEFAULT; Schema: dse_advisory; Owner: postgres
--

ALTER TABLE ONLY dse_advisory.document ALTER COLUMN id SET DEFAULT nextval('dse_advisory.document_id_seq'::regclass);


--
-- TOC entry 3526 (class 2604 OID 16452)
-- Name: news id; Type: DEFAULT; Schema: dse_advisory; Owner: postgres
--

ALTER TABLE ONLY dse_advisory.news ALTER COLUMN id SET DEFAULT nextval('dse_advisory.news_id_seq'::regclass);


--
-- TOC entry 3529 (class 2604 OID 16463)
-- Name: news_target cohort_id; Type: DEFAULT; Schema: dse_advisory; Owner: postgres
--

ALTER TABLE ONLY dse_advisory.news_target ALTER COLUMN cohort_id SET DEFAULT nextval('dse_advisory.news_target_cohort_id_seq'::regclass);


--
-- TOC entry 3530 (class 2604 OID 16464)
-- Name: news_target news_id; Type: DEFAULT; Schema: dse_advisory; Owner: postgres
--

ALTER TABLE ONLY dse_advisory.news_target ALTER COLUMN news_id SET DEFAULT nextval('dse_advisory.news_target_news_id_seq'::regclass);


--
-- TOC entry 3533 (class 2604 OID 16574)
-- Name: thesis id; Type: DEFAULT; Schema: dse_advisory; Owner: postgres
--

ALTER TABLE ONLY dse_advisory.thesis ALTER COLUMN id SET DEFAULT nextval('dse_advisory.thesis_id_seq'::regclass);


--
-- TOC entry 3535 (class 2604 OID 16597)
-- Name: thesis_doc document_id; Type: DEFAULT; Schema: dse_advisory; Owner: postgres
--

ALTER TABLE ONLY dse_advisory.thesis_doc ALTER COLUMN document_id SET DEFAULT nextval('dse_advisory.thesis_doc_document_id_seq'::regclass);


--
-- TOC entry 3536 (class 2604 OID 16598)
-- Name: thesis_doc thesis_id; Type: DEFAULT; Schema: dse_advisory; Owner: postgres
--

ALTER TABLE ONLY dse_advisory.thesis_doc ALTER COLUMN thesis_id SET DEFAULT nextval('dse_advisory.thesis_doc_thesis_id_seq'::regclass);


--
-- TOC entry 3537 (class 2604 OID 16616)
-- Name: thesis_proposal id; Type: DEFAULT; Schema: dse_advisory; Owner: postgres
--

ALTER TABLE ONLY dse_advisory.thesis_proposal ALTER COLUMN id SET DEFAULT nextval('dse_advisory.thesis_proposal_id_seq'::regclass);


--
-- TOC entry 3719 (class 0 OID 16402)
-- Dependencies: 216
-- Data for Name: cohort; Type: TABLE DATA; Schema: dse_advisory; Owner: postgres
--

COPY dse_advisory.cohort (id, name) FROM stdin;
1	2000
2	2001
3	2002
4	2003
5	2004
6	2005
7	2006
8	2007
10	2008
11	2009
12	2010
13	2011
14	2012
15	2013
16	2014
17	2015
18	2016
19	2017
20	2018
21	2019
22	2020
23	2021
24	2022
25	2023
26	2024
27	2025
\.


--
-- TOC entry 3722 (class 0 OID 16443)
-- Dependencies: 219
-- Data for Name: coordinator; Type: TABLE DATA; Schema: dse_advisory; Owner: postgres
--

COPY dse_advisory.coordinator (username, password, firstname, lastname, is_active, salt) FROM stdin;
admin	$2b$12$trC9dOW6nliu361IGToI0e37NOb6hnkAMYnvXmOdftQnWrRa.VDK6	Stefano	Montanelli	t	$2b$12$trC9dOW6nliu361IGToI0e
\.


--
-- TOC entry 3729 (class 0 OID 16478)
-- Dependencies: 226
-- Data for Name: document; Type: TABLE DATA; Schema: dse_advisory; Owner: postgres
--

COPY dse_advisory.document (id, link, description, upload_time, is_deleted) FROM stdin;
16	/Users/lucascarantino/Documents/dse_advisory/uploaded_docs/ASCII_20241024_172016.pdf	\N	2024-10-24 17:20:16.133307	\N
17	/Users/lucascarantino/Documents/dse_advisory/uploaded_docs/ASCII_2_20241024_172024.pdf	\N	2024-10-24 17:20:24.186116	\N
18	/Users/lucascarantino/Documents/dse_advisory/uploaded_docs/pianoDiStudio2023_2024_20241024_172637.pdf	\N	2024-10-24 17:26:37.09982	\N
20	/Users/lucascarantino/Documents/dse_advisory/uploaded_docs/Diagramma di flusso autenticazione CAS_20241025_183835.pdf	\N	2024-10-25 18:38:35.092723	\N
21	/Users/lucascarantino/Documents/dse_advisory/uploaded_docs/Modello ER tesi_20241025_184318.pdf	\N	2024-10-25 18:43:18.35231	\N
22	/Users/lucascarantino/Documents/dse_advisory/uploaded_docs/ASCII_2_20241107_113317.pdf	\N	2024-11-07 11:33:17.935607	\N
\.


--
-- TOC entry 3724 (class 0 OID 16449)
-- Dependencies: 221
-- Data for Name: news; Type: TABLE DATA; Schema: dse_advisory; Owner: postgres
--

COPY dse_advisory.news (id, subject, content, is_deleted, publication_date, expiration_date) FROM stdin;
33	prova di expiration date	contenuto prova di expiration date	f	2024-10-21 19:01:31.33318	2024-10-30
32	Prova upload file multipli editato x4	Contenuto prova di file multipli editato x4	f	2024-10-09 19:08:21.998865	\N
34	prova subject	Ciao a tutti	f	2024-11-07 11:28:33.908601	\N
\.


--
-- TOC entry 3739 (class 0 OID 16824)
-- Dependencies: 237
-- Data for Name: news_doc; Type: TABLE DATA; Schema: dse_advisory; Owner: postgres
--

COPY dse_advisory.news_doc (news_id, document_id) FROM stdin;
33	16
33	17
33	18
33	20
33	21
34	22
\.


--
-- TOC entry 3727 (class 0 OID 16460)
-- Dependencies: 224
-- Data for Name: news_target; Type: TABLE DATA; Schema: dse_advisory; Owner: postgres
--

COPY dse_advisory.news_target (cohort_id, news_id) FROM stdin;
23	33
22	33
1	32
2	32
3	32
4	32
5	32
6	32
7	32
8	32
10	32
11	32
12	32
13	32
14	32
15	32
16	32
17	32
18	32
19	32
20	32
21	32
22	32
23	32
24	32
25	32
26	32
27	32
22	34
23	34
\.


--
-- TOC entry 3738 (class 0 OID 16695)
-- Dependencies: 236
-- Data for Name: staging; Type: TABLE DATA; Schema: dse_advisory; Owner: postgres
--

COPY dse_advisory.staging (username, token, user_type) FROM stdin;
lucas.inter@hotmail.it	9dc8ba0d-8cc7-4c56-9643-c899981cdf20	student
ariannaconverti@gmail.com	610b3e2a-e438-436f-bec7-0a80121adac0	student
\.


--
-- TOC entry 3720 (class 0 OID 16428)
-- Dependencies: 217
-- Data for Name: student; Type: TABLE DATA; Schema: dse_advisory; Owner: postgres
--

COPY dse_advisory.student (serial_id, username, password, firstname, lastname, is_active, cohort_id, salt) FROM stdin;
874026	luca.scarantino@studenti.unimi.it	$2b$12$9JnjwsBEFXdtBC5LcmMJH.fBOUuET6b/2y7O0LlXg0GabhEX8c4/W	Luca	Scarantino	t	17	$2b$12$9JnjwsBEFXdtBC5LcmMJH.
090308	luca.scarantino@unimi.it	$2b$12$AgljJ9ebrLJp6fEN4NEgXOjgvkaFiEmLD0oFfDAuy7aSAAKd5B3aK	Luca	Scara	t	19	$2b$12$AgljJ9ebrLJp6fEN4NEgXO
123456	paperina	$2b$12$3zzBOYCaDKjiTOjLZsg2E.VaJc2CGozxbxaXYRrl16yPmoD2/XDY2	Paperina	Di Paperino	f	\N	$2b$12$3zzBOYCaDKjiTOjLZsg2E.
345678	pluto	$2b$12$wpGdmTjxf/X3w6ZFv4wEBeD1dSo..fuKB/HhDaOGbnSbSRLTZ53Hu	Pluto	Plutone	f	\N	$2b$12$wpGdmTjxf/X3w6ZFv4wEBe
789012	paperino	$2b$12$XbaqjXzorDnM43B/hcxxM.HwWI.dQglW/QAXBU0G/kGstTJzUeW16	Paolino	Paperino	f	\N	$2b$12$XbaqjXzorDnM43B/hcxxM.
\.


--
-- TOC entry 3721 (class 0 OID 16438)
-- Dependencies: 218
-- Data for Name: teacher; Type: TABLE DATA; Schema: dse_advisory; Owner: postgres
--

COPY dse_advisory.teacher (username, password, firstname, lastname, is_active, institution, salt) FROM stdin;
mario	$2b$12$.5JWZjUR21DUahz2p9p5vOmNW5li85QCjvNOa.1.6pdbRTNqPWDl.	Mario	Rossi	f	\N	$2b$12$.5JWZjUR21DUahz2p9p5vO
luca.scara03@gmail.com	$2b$12$Rl6mAmRdk/yMJhI5Iac2Suj8U8aR5m0OGUB3tNKNEdJQrxX3ajTAe	Roberto	Scarantino	t	\N	$2b$12$Rl6mAmRdk/yMJhI5Iac2Su
admin	\N	Stefano	Montanelli	t	\N	\N
\.


--
-- TOC entry 3731 (class 0 OID 16571)
-- Dependencies: 228
-- Data for Name: thesis; Type: TABLE DATA; Schema: dse_advisory; Owner: postgres
--

COPY dse_advisory.thesis (id, assignmentdate, discussiondate, is_deleted, title, student_username, supervisor, co_supervisor) FROM stdin;
6	2024-12-02	\N	f	prova con nuovo assetto del database	luca.scarantino@studenti.unimi.it	admin	luca.scara03@gmail.com
\.


--
-- TOC entry 3734 (class 0 OID 16594)
-- Dependencies: 231
-- Data for Name: thesis_doc; Type: TABLE DATA; Schema: dse_advisory; Owner: postgres
--

COPY dse_advisory.thesis_doc (document_id, thesis_id) FROM stdin;
\.


--
-- TOC entry 3737 (class 0 OID 16613)
-- Dependencies: 234
-- Data for Name: thesis_proposal; Type: TABLE DATA; Schema: dse_advisory; Owner: postgres
--

COPY dse_advisory.thesis_proposal (id, title, description, is_deleted, keys, duration, expiration, thesis_id, teacher) FROM stdin;
5	prova di tesi con database modificato	questa prova di tesi serve per vedere se funziona tutto correttamente	f	prova correttamente	50	\N	\N	admin
\.


--
-- TOC entry 3755 (class 0 OID 0)
-- Dependencies: 215
-- Name: cohort_id_seq; Type: SEQUENCE SET; Schema: dse_advisory; Owner: postgres
--

SELECT pg_catalog.setval('dse_advisory.cohort_id_seq', 27, true);


--
-- TOC entry 3756 (class 0 OID 0)
-- Dependencies: 225
-- Name: document_id_seq; Type: SEQUENCE SET; Schema: dse_advisory; Owner: postgres
--

SELECT pg_catalog.setval('dse_advisory.document_id_seq', 26, true);


--
-- TOC entry 3757 (class 0 OID 0)
-- Dependencies: 220
-- Name: news_id_seq; Type: SEQUENCE SET; Schema: dse_advisory; Owner: postgres
--

SELECT pg_catalog.setval('dse_advisory.news_id_seq', 34, true);


--
-- TOC entry 3758 (class 0 OID 0)
-- Dependencies: 222
-- Name: news_target_cohort_id_seq; Type: SEQUENCE SET; Schema: dse_advisory; Owner: postgres
--

SELECT pg_catalog.setval('dse_advisory.news_target_cohort_id_seq', 1, false);


--
-- TOC entry 3759 (class 0 OID 0)
-- Dependencies: 223
-- Name: news_target_news_id_seq; Type: SEQUENCE SET; Schema: dse_advisory; Owner: postgres
--

SELECT pg_catalog.setval('dse_advisory.news_target_news_id_seq', 1, false);


--
-- TOC entry 3760 (class 0 OID 0)
-- Dependencies: 229
-- Name: thesis_doc_document_id_seq; Type: SEQUENCE SET; Schema: dse_advisory; Owner: postgres
--

SELECT pg_catalog.setval('dse_advisory.thesis_doc_document_id_seq', 1, false);


--
-- TOC entry 3761 (class 0 OID 0)
-- Dependencies: 230
-- Name: thesis_doc_thesis_id_seq; Type: SEQUENCE SET; Schema: dse_advisory; Owner: postgres
--

SELECT pg_catalog.setval('dse_advisory.thesis_doc_thesis_id_seq', 1, false);


--
-- TOC entry 3762 (class 0 OID 0)
-- Dependencies: 227
-- Name: thesis_id_seq; Type: SEQUENCE SET; Schema: dse_advisory; Owner: postgres
--

SELECT pg_catalog.setval('dse_advisory.thesis_id_seq', 6, true);


--
-- TOC entry 3763 (class 0 OID 0)
-- Dependencies: 232
-- Name: thesis_proposal_id_seq; Type: SEQUENCE SET; Schema: dse_advisory; Owner: postgres
--

SELECT pg_catalog.setval('dse_advisory.thesis_proposal_id_seq', 5, true);


--
-- TOC entry 3764 (class 0 OID 0)
-- Dependencies: 233
-- Name: thesis_proposal_thesis_id_seq; Type: SEQUENCE SET; Schema: dse_advisory; Owner: postgres
--

SELECT pg_catalog.setval('dse_advisory.thesis_proposal_thesis_id_seq', 1, true);


--
-- TOC entry 3540 (class 2606 OID 16407)
-- Name: cohort cohort_pkey; Type: CONSTRAINT; Schema: dse_advisory; Owner: postgres
--

ALTER TABLE ONLY dse_advisory.cohort
    ADD CONSTRAINT cohort_pkey PRIMARY KEY (id);


--
-- TOC entry 3546 (class 2606 OID 16447)
-- Name: coordinator coordinator_pkey; Type: CONSTRAINT; Schema: dse_advisory; Owner: postgres
--

ALTER TABLE ONLY dse_advisory.coordinator
    ADD CONSTRAINT coordinator_pkey PRIMARY KEY (username);


--
-- TOC entry 3552 (class 2606 OID 16486)
-- Name: document document_pkey; Type: CONSTRAINT; Schema: dse_advisory; Owner: postgres
--

ALTER TABLE ONLY dse_advisory.document
    ADD CONSTRAINT document_pkey PRIMARY KEY (id);


--
-- TOC entry 3562 (class 2606 OID 16828)
-- Name: news_doc news_doc_pkey; Type: CONSTRAINT; Schema: dse_advisory; Owner: postgres
--

ALTER TABLE ONLY dse_advisory.news_doc
    ADD CONSTRAINT news_doc_pkey PRIMARY KEY (news_id, document_id);


--
-- TOC entry 3548 (class 2606 OID 16457)
-- Name: news news_pkey; Type: CONSTRAINT; Schema: dse_advisory; Owner: postgres
--

ALTER TABLE ONLY dse_advisory.news
    ADD CONSTRAINT news_pkey PRIMARY KEY (id);


--
-- TOC entry 3550 (class 2606 OID 16466)
-- Name: news_target news_target_pkey; Type: CONSTRAINT; Schema: dse_advisory; Owner: postgres
--

ALTER TABLE ONLY dse_advisory.news_target
    ADD CONSTRAINT news_target_pkey PRIMARY KEY (cohort_id, news_id);


--
-- TOC entry 3560 (class 2606 OID 16840)
-- Name: staging staging_pkey; Type: CONSTRAINT; Schema: dse_advisory; Owner: postgres
--

ALTER TABLE ONLY dse_advisory.staging
    ADD CONSTRAINT staging_pkey PRIMARY KEY (username);


--
-- TOC entry 3542 (class 2606 OID 16432)
-- Name: student student_pkey; Type: CONSTRAINT; Schema: dse_advisory; Owner: postgres
--

ALTER TABLE ONLY dse_advisory.student
    ADD CONSTRAINT student_pkey PRIMARY KEY (serial_id, username);


--
-- TOC entry 3544 (class 2606 OID 16442)
-- Name: teacher teacher_pkey; Type: CONSTRAINT; Schema: dse_advisory; Owner: postgres
--

ALTER TABLE ONLY dse_advisory.teacher
    ADD CONSTRAINT teacher_pkey PRIMARY KEY (username);


--
-- TOC entry 3556 (class 2606 OID 16600)
-- Name: thesis_doc thesis_doc_pkey; Type: CONSTRAINT; Schema: dse_advisory; Owner: postgres
--

ALTER TABLE ONLY dse_advisory.thesis_doc
    ADD CONSTRAINT thesis_doc_pkey PRIMARY KEY (document_id, thesis_id);


--
-- TOC entry 3554 (class 2606 OID 16576)
-- Name: thesis thesis_pkey; Type: CONSTRAINT; Schema: dse_advisory; Owner: postgres
--

ALTER TABLE ONLY dse_advisory.thesis
    ADD CONSTRAINT thesis_pkey PRIMARY KEY (id);


--
-- TOC entry 3558 (class 2606 OID 16621)
-- Name: thesis_proposal thesis_proposal_pkey; Type: CONSTRAINT; Schema: dse_advisory; Owner: postgres
--

ALTER TABLE ONLY dse_advisory.thesis_proposal
    ADD CONSTRAINT thesis_proposal_pkey PRIMARY KEY (id);


--
-- TOC entry 3572 (class 2606 OID 16834)
-- Name: news_doc news_doc_document_id_fkey; Type: FK CONSTRAINT; Schema: dse_advisory; Owner: postgres
--

ALTER TABLE ONLY dse_advisory.news_doc
    ADD CONSTRAINT news_doc_document_id_fkey FOREIGN KEY (document_id) REFERENCES dse_advisory.document(id) ON DELETE CASCADE;


--
-- TOC entry 3573 (class 2606 OID 16829)
-- Name: news_doc news_doc_news_id_fkey; Type: FK CONSTRAINT; Schema: dse_advisory; Owner: postgres
--

ALTER TABLE ONLY dse_advisory.news_doc
    ADD CONSTRAINT news_doc_news_id_fkey FOREIGN KEY (news_id) REFERENCES dse_advisory.news(id) ON DELETE CASCADE;


--
-- TOC entry 3564 (class 2606 OID 16467)
-- Name: news_target news_target_cohort_id_fkey; Type: FK CONSTRAINT; Schema: dse_advisory; Owner: postgres
--

ALTER TABLE ONLY dse_advisory.news_target
    ADD CONSTRAINT news_target_cohort_id_fkey FOREIGN KEY (cohort_id) REFERENCES dse_advisory.cohort(id);


--
-- TOC entry 3565 (class 2606 OID 16472)
-- Name: news_target news_target_news_id_fkey; Type: FK CONSTRAINT; Schema: dse_advisory; Owner: postgres
--

ALTER TABLE ONLY dse_advisory.news_target
    ADD CONSTRAINT news_target_news_id_fkey FOREIGN KEY (news_id) REFERENCES dse_advisory.news(id);


--
-- TOC entry 3563 (class 2606 OID 16433)
-- Name: student student_cohort_id_fkey; Type: FK CONSTRAINT; Schema: dse_advisory; Owner: postgres
--

ALTER TABLE ONLY dse_advisory.student
    ADD CONSTRAINT student_cohort_id_fkey FOREIGN KEY (cohort_id) REFERENCES dse_advisory.cohort(id);


--
-- TOC entry 3566 (class 2606 OID 16587)
-- Name: thesis thesis_co_supervisor_fkey; Type: FK CONSTRAINT; Schema: dse_advisory; Owner: postgres
--

ALTER TABLE ONLY dse_advisory.thesis
    ADD CONSTRAINT thesis_co_supervisor_fkey FOREIGN KEY (co_supervisor) REFERENCES dse_advisory.teacher(username);


--
-- TOC entry 3568 (class 2606 OID 16858)
-- Name: thesis_doc thesis_doc_document_id_fkey; Type: FK CONSTRAINT; Schema: dse_advisory; Owner: postgres
--

ALTER TABLE ONLY dse_advisory.thesis_doc
    ADD CONSTRAINT thesis_doc_document_id_fkey FOREIGN KEY (document_id) REFERENCES dse_advisory.document(id) ON DELETE CASCADE NOT VALID;


--
-- TOC entry 3569 (class 2606 OID 16606)
-- Name: thesis_doc thesis_doc_thesis_id_fkey; Type: FK CONSTRAINT; Schema: dse_advisory; Owner: postgres
--

ALTER TABLE ONLY dse_advisory.thesis_doc
    ADD CONSTRAINT thesis_doc_thesis_id_fkey FOREIGN KEY (thesis_id) REFERENCES dse_advisory.thesis(id);


--
-- TOC entry 3570 (class 2606 OID 16627)
-- Name: thesis_proposal thesis_proposal_teacher_fkey; Type: FK CONSTRAINT; Schema: dse_advisory; Owner: postgres
--

ALTER TABLE ONLY dse_advisory.thesis_proposal
    ADD CONSTRAINT thesis_proposal_teacher_fkey FOREIGN KEY (teacher) REFERENCES dse_advisory.teacher(username);


--
-- TOC entry 3571 (class 2606 OID 16622)
-- Name: thesis_proposal thesis_proposal_thesis_id_fkey; Type: FK CONSTRAINT; Schema: dse_advisory; Owner: postgres
--

ALTER TABLE ONLY dse_advisory.thesis_proposal
    ADD CONSTRAINT thesis_proposal_thesis_id_fkey FOREIGN KEY (thesis_id) REFERENCES dse_advisory.thesis(id);


--
-- TOC entry 3567 (class 2606 OID 16582)
-- Name: thesis thesis_supervisor_fkey; Type: FK CONSTRAINT; Schema: dse_advisory; Owner: postgres
--

ALTER TABLE ONLY dse_advisory.thesis
    ADD CONSTRAINT thesis_supervisor_fkey FOREIGN KEY (supervisor) REFERENCES dse_advisory.teacher(username);


-- Completed on 2024-12-02 19:55:54 CET

--
-- PostgreSQL database dump complete
--

