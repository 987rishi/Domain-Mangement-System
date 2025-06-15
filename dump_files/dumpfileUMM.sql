--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: Designation; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Designation" AS ENUM (
    'SCIENTIST_E',
    'SCIENTIST_F'
);


ALTER TYPE public."Designation" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'DRM',
    'ARM',
    'HOD',
    'ED',
    'NETOPS',
    'WEBMASTER',
    'HODHPC'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- Name: ServiceType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ServiceType" AS ENUM (
    'INTERNAL',
    'EXTERNAL'
);


ALTER TYPE public."ServiceType" OWNER TO postgres;

--
-- Name: Status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Status" AS ENUM (
    'YES',
    'NO',
    'NA'
);


ALTER TYPE public."Status" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AppUser; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AppUser" (
    emp_no bigint NOT NULL,
    usr_email character varying(100) NOT NULL,
    role public."Role" NOT NULL,
    usr_fname character varying(255) NOT NULL,
    usr_lname character varying(255) NOT NULL,
    centre_id integer NOT NULL
);


ALTER TABLE public."AppUser" OWNER TO postgres;

--
-- Name: Arm; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Arm" (
    emp_no bigint NOT NULL,
    arm_fname character varying(100) NOT NULL,
    arm_lname character varying(100) NOT NULL,
    email_id character varying(255) NOT NULL,
    desig character varying(50),
    tele_no character varying(20),
    mob_no character varying(20),
    centre_id integer NOT NULL,
    grp_id integer NOT NULL,
    is_active boolean DEFAULT true
);


ALTER TABLE public."Arm" OWNER TO postgres;

--
-- Name: Centre; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Centre" (
    centre_id integer NOT NULL,
    cn_name character varying(255) NOT NULL,
    netops_red bigint
);


ALTER TABLE public."Centre" OWNER TO postgres;

--
-- Name: Centre_centre_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Centre_centre_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Centre_centre_id_seq" OWNER TO postgres;

--
-- Name: Centre_centre_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Centre_centre_id_seq" OWNED BY public."Centre".centre_id;


--
-- Name: Drm; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Drm" (
    emp_no bigint NOT NULL,
    drm_fname character varying(100) NOT NULL,
    drm_lname character varying(100) NOT NULL,
    email_id character varying(255) NOT NULL,
    desig character varying(50),
    tele_no character varying(20),
    mob_no character varying(20),
    centre_id integer NOT NULL,
    grp_id integer NOT NULL,
    is_active boolean DEFAULT true
);


ALTER TABLE public."Drm" OWNER TO postgres;

--
-- Name: EdCentreHead; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."EdCentreHead" (
    emp_no bigint NOT NULL,
    fname text NOT NULL,
    lname text NOT NULL,
    email_id text NOT NULL,
    tele_no text NOT NULL,
    mob_no text NOT NULL,
    centre_id integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public."EdCentreHead" OWNER TO postgres;

--
-- Name: GroupDepartment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."GroupDepartment" (
    dept_id integer NOT NULL,
    d_name character varying(50) NOT NULL,
    centre_id integer NOT NULL
);


ALTER TABLE public."GroupDepartment" OWNER TO postgres;

--
-- Name: GroupDepartment_dept_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."GroupDepartment_dept_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."GroupDepartment_dept_id_seq" OWNER TO postgres;

--
-- Name: GroupDepartment_dept_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."GroupDepartment_dept_id_seq" OWNED BY public."GroupDepartment".dept_id;


--
-- Name: Hod; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Hod" (
    emp_no bigint NOT NULL,
    hod_fname text NOT NULL,
    hod_lname text NOT NULL,
    email_id text NOT NULL,
    tele_no text NOT NULL,
    mob_no text NOT NULL,
    centre_id integer NOT NULL,
    grp_id integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public."Hod" OWNER TO postgres;

--
-- Name: HodHpcIandE; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."HodHpcIandE" (
    emp_no bigint NOT NULL,
    fname text NOT NULL,
    lname text NOT NULL,
    tele_no text NOT NULL,
    mob_no text NOT NULL,
    email_id text NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public."HodHpcIandE" OWNER TO postgres;

--
-- Name: MemberNetops; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MemberNetops" (
    emp_no bigint NOT NULL,
    fname text NOT NULL,
    lname text NOT NULL,
    tele_no text NOT NULL,
    mob_no text NOT NULL,
    email_id text NOT NULL,
    centre_id integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public."MemberNetops" OWNER TO postgres;

--
-- Name: ProjectAssignment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProjectAssignment" (
    project_id bigint NOT NULL,
    project_name character varying(100) NOT NULL,
    project_remarks text NOT NULL,
    drm_emp_no bigint NOT NULL,
    arm_emp_no bigint NOT NULL,
    hod_emp_no bigint NOT NULL
);


ALTER TABLE public."ProjectAssignment" OWNER TO postgres;

--
-- Name: ProjectAssignment_project_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ProjectAssignment_project_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ProjectAssignment_project_id_seq" OWNER TO postgres;

--
-- Name: ProjectAssignment_project_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ProjectAssignment_project_id_seq" OWNED BY public."ProjectAssignment".project_id;


--
-- Name: WebMaster; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WebMaster" (
    emp_no bigint NOT NULL,
    fname text NOT NULL,
    lname text NOT NULL,
    tele_no text NOT NULL,
    mob_no text NOT NULL,
    email_id text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    centre_id integer NOT NULL
);


ALTER TABLE public."WebMaster" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: Centre centre_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Centre" ALTER COLUMN centre_id SET DEFAULT nextval('public."Centre_centre_id_seq"'::regclass);


--
-- Name: GroupDepartment dept_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GroupDepartment" ALTER COLUMN dept_id SET DEFAULT nextval('public."GroupDepartment_dept_id_seq"'::regclass);


--
-- Name: ProjectAssignment project_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProjectAssignment" ALTER COLUMN project_id SET DEFAULT nextval('public."ProjectAssignment_project_id_seq"'::regclass);


--
-- Data for Name: AppUser; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AppUser" (emp_no, usr_email, role, usr_fname, usr_lname, centre_id) FROM stdin;
220004	priya@cdac.in	DRM	Priya	Rani	1
220008	manish@cdac.in	DRM	Manish	Sharma	1
220010	csb22062@tezu.ac.in	DRM	Vikrant	Kumar	1
220055	csb22055@tezu.ac.in	DRM	Raj	Raushan	1
220067	csb22067@cdac.in	DRM	Aryan	Sharma	1
220006	saurav@cdac.in	DRM	Saurav	Kumar	1
220005	csb22005@tezu.ac.in	ARM	Rishi	Sarkar	1
220009	csb22052@tezu.ac.in	ARM	Ankit	Anand	1
220003	arjunDRM@cdac.in	DRM	Arjun	Singh	1
220002	nidhiARM@cdac.in	ARM	Nidhi	Kumari	1
220007	tanyaHOD@cdac.in	HOD	Tanya	Verma	1
220012	meeraHOD.joshi@cdac.in	HOD	Meera	Joshi	1
7001	anilNETOPS.patil@cdac.in	NETOPS	Anil	Patil	2
220080	hcblock711@gmail.com	HOD	Neeraj	Ranjan	1
220013	rajraushankota@gmail.com	ED	Ravi	Kumar	1
220001	rajraushan7112002@gmail.com	NETOPS	Ankit	Mishra	1
8001	rishisarkar783@gmail.com	WEBMASTER	Neha	Kulkarni	1
6001	rishisarkar234@gmail.com	HODHPC	Sneha	Rane	1
\.


--
-- Data for Name: Arm; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Arm" (emp_no, arm_fname, arm_lname, email_id, desig, tele_no, mob_no, centre_id, grp_id, is_active) FROM stdin;
220009	Ankit	Anand	csb22052@tezu.ac.in	SCIENTIST_E	\N	\N	1	1	t
220002	Nidhi	Kumari	nidhiARM@cdac.in	SCIENTIST_E	32634646	8794474786	1	1	t
220005	Rishi	Sarkar	csb22005@tezu.ac.in	SCIENTIST_E	54321	9234567890	1	3	t
\.


--
-- Data for Name: Centre; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Centre" (centre_id, cn_name, netops_red) FROM stdin;
1	Pune Centre	\N
2	Delhi Centre	\N
\.


--
-- Data for Name: Drm; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Drm" (emp_no, drm_fname, drm_lname, email_id, desig, tele_no, mob_no, centre_id, grp_id, is_active) FROM stdin;
220004	Priya	Rani	priya@cdac.in	SCIENTIST_E	\N	\N	1	1	t
220006	Saurav	Kumar	saurav@cdac.in	SCIENTIST_E	\N	\N	1	1	t
220008	Manish	Sharma	manish@cdac.in	SCIENTIST_E	\N	\N	1	1	t
220010	Vikrant	Kumar	csb22062@tezu.ac.in	SCIENTIST_E	\N	\N	1	1	t
220067	Aryan	Sharma	csb22067@cdac.in	SCIENTIST_E	\N	\N	1	1	t
220003	Arjun	Singh	arjunDRM@cdac.in	SCIENTIST_E	32634646	9876543210	1	1	t
220055	Raj	Raushan	csb22055@tezu.ac.in	SCIENTIST_E	34678	6033099550	1	3	t
\.


--
-- Data for Name: EdCentreHead; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."EdCentreHead" (emp_no, fname, lname, email_id, tele_no, mob_no, centre_id, is_active) FROM stdin;
220013	Ravi	Kumar	rajraushankota@gmail.com	0349174919	9867382681	1	t
\.


--
-- Data for Name: GroupDepartment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."GroupDepartment" (dept_id, d_name, centre_id) FROM stdin;
1	Cyber Security	1
2	Data Analytics	2
3	Computer Science	1
\.


--
-- Data for Name: Hod; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Hod" (emp_no, hod_fname, hod_lname, email_id, tele_no, mob_no, centre_id, grp_id, is_active) FROM stdin;
220007	Tanya	Verma	tanyaHOD@cdac.in	011-1234567	9876543217	1	2	t
220012	Meera	Joshi	meeraHOD.joshi@cdac.in	0207654321	9123456789	1	1	f
220080	Neeraj	Ranjan	hcblock711@gmail.com	011-1234561	8079975675	1	3	t
\.


--
-- Data for Name: HodHpcIandE; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."HodHpcIandE" (emp_no, fname, lname, tele_no, mob_no, email_id, is_active) FROM stdin;
6001	Sneha	Rane	0206666777	9333333333	rishisarkar234@gmail.com	t
\.


--
-- Data for Name: MemberNetops; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MemberNetops" (emp_no, fname, lname, tele_no, mob_no, email_id, centre_id, is_active) FROM stdin;
7001	Anil	Patil	0208888999	9444444444	anilNETOPS.patil@cdac.in	2	t
220001	Ankit	Mishra	0208887899	9876546796	rajraushan7112002@gmail.com	1	t
\.


--
-- Data for Name: ProjectAssignment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProjectAssignment" (project_id, project_name, project_remarks, drm_emp_no, arm_emp_no, hod_emp_no) FROM stdin;
5	HELLOW WORLD PROJECT	PROJECT FOR HELLOW WORLD	220003	220002	220012
6	BIG PROJECT	dfafasfasf	220003	220002	220012
9	BIG PROJECTvqwdqwd	dfafasfasf	220003	220002	220012
10	project1	project desc	220003	220002	220012
11	project2	njnajnca	220003	220002	220012
12	projectnew	new project	220003	220002	220012
13	projecttest	it is a project	220003	220002	220012
14	new project	good project	220003	220002	220012
15	someproject	project description	220003	220002	220012
16	projecttesting	testing	220003	220002	220012
17	project4	this is a new project	220003	220002	220012
18	project5	this is a test project	220003	220002	220012
19	Hello world	Testing right user is sending the request it or not	220006	220005	220007
20	hello testing user		220004	220005	220007
21	email-testing		220055	220005	220080
22	email-testing-03-06-2025	testing email notifications and auto notifications based on 15,30,60 days 	220055	220005	220080
23	email testing demo 03-06-2025	This is for demo purpose	220055	220005	220080
24	testing activity card notifications	Hii Raj this side	220055	220005	220080
25	testing activity card notifications with email	A project is assigning to ARM and DRM for testing purpose	220055	220005	220080
27	testing activity card notifications with email testing again	again testing it 	220055	220005	220080
28	testing activity card notifications oohoo	hello there	220055	220005	220080
29	NotificationTesting		220055	220005	220080
30	Testing Modal	modal testing on form submission	220055	220005	220080
\.


--
-- Data for Name: WebMaster; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WebMaster" (emp_no, fname, lname, tele_no, mob_no, email_id, is_active, centre_id) FROM stdin;
8001	Neha	Kulkarni	0209999000	9555555555	rishisarkar783@gmail.com	t	1
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
0a4ea152-7a84-4f5c-8b40-ba2593b167ac	d00752f3dcd7a5561eca841916121105a5c1e19e65f76bbb32f6b7a0b0cf4b61	2025-04-06 11:00:51.982729+05:30	20250406053051_usermanagementmicroservice	\N	\N	2025-04-06 11:00:51.923177+05:30	1
ead4c423-b790-41c4-b80d-4aa7e64c69df	ff4a47392e092a8b70ee9ca1adfab787fe94443581ec9f3dff6f8212270a91cc	2025-04-06 11:16:43.562163+05:30	20250406054643_made_some_changes	\N	\N	2025-04-06 11:16:43.558608+05:30	1
d2adfd3a-38d9-4d09-8c4c-e4845239b9ba	5779909f84a7fc39d70fd5498a3c9463c1ae9aaa01f6415383b6e3d419a22b9c	2025-04-06 20:12:14.163173+05:30	20250406144214_made_some_changes	\N	\N	2025-04-06 20:12:14.146611+05:30	1
\.


--
-- Name: Centre_centre_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Centre_centre_id_seq"', 1, false);


--
-- Name: GroupDepartment_dept_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."GroupDepartment_dept_id_seq"', 2, true);


--
-- Name: ProjectAssignment_project_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ProjectAssignment_project_id_seq"', 30, true);


--
-- Name: AppUser AppUser_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AppUser"
    ADD CONSTRAINT "AppUser_pkey" PRIMARY KEY (emp_no);


--
-- Name: Arm Arm_email_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Arm"
    ADD CONSTRAINT "Arm_email_id_key" UNIQUE (email_id);


--
-- Name: Arm Arm_mob_no_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Arm"
    ADD CONSTRAINT "Arm_mob_no_key" UNIQUE (mob_no);


--
-- Name: Arm Arm_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Arm"
    ADD CONSTRAINT "Arm_pkey" PRIMARY KEY (emp_no);


--
-- Name: Arm Arm_tele_no_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Arm"
    ADD CONSTRAINT "Arm_tele_no_key" UNIQUE (tele_no);


--
-- Name: Centre Centre_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Centre"
    ADD CONSTRAINT "Centre_pkey" PRIMARY KEY (centre_id);


--
-- Name: Drm Drm_email_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Drm"
    ADD CONSTRAINT "Drm_email_id_key" UNIQUE (email_id);


--
-- Name: Drm Drm_mob_no_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Drm"
    ADD CONSTRAINT "Drm_mob_no_key" UNIQUE (mob_no);


--
-- Name: Drm Drm_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Drm"
    ADD CONSTRAINT "Drm_pkey" PRIMARY KEY (emp_no);


--
-- Name: Drm Drm_tele_no_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Drm"
    ADD CONSTRAINT "Drm_tele_no_key" UNIQUE (tele_no);


--
-- Name: EdCentreHead EdCentreHead_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EdCentreHead"
    ADD CONSTRAINT "EdCentreHead_pkey" PRIMARY KEY (emp_no);


--
-- Name: GroupDepartment GroupDepartment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GroupDepartment"
    ADD CONSTRAINT "GroupDepartment_pkey" PRIMARY KEY (dept_id);


--
-- Name: HodHpcIandE HodHpcIandE_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."HodHpcIandE"
    ADD CONSTRAINT "HodHpcIandE_pkey" PRIMARY KEY (emp_no);


--
-- Name: Hod Hod_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Hod"
    ADD CONSTRAINT "Hod_pkey" PRIMARY KEY (emp_no);


--
-- Name: MemberNetops MemberNetops_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MemberNetops"
    ADD CONSTRAINT "MemberNetops_pkey" PRIMARY KEY (emp_no);


--
-- Name: ProjectAssignment ProjectAssignment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProjectAssignment"
    ADD CONSTRAINT "ProjectAssignment_pkey" PRIMARY KEY (project_id);


--
-- Name: WebMaster WebMaster_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WebMaster"
    ADD CONSTRAINT "WebMaster_pkey" PRIMARY KEY (emp_no);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: AppUser_emp_no_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "AppUser_emp_no_key" ON public."AppUser" USING btree (emp_no);


--
-- Name: AppUser_usr_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "AppUser_usr_email_key" ON public."AppUser" USING btree (usr_email);


--
-- Name: Centre_cn_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Centre_cn_name_key" ON public."Centre" USING btree (cn_name);


--
-- Name: EdCentreHead_centre_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "EdCentreHead_centre_id_key" ON public."EdCentreHead" USING btree (centre_id);


--
-- Name: EdCentreHead_email_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "EdCentreHead_email_id_key" ON public."EdCentreHead" USING btree (email_id);


--
-- Name: EdCentreHead_mob_no_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "EdCentreHead_mob_no_key" ON public."EdCentreHead" USING btree (mob_no);


--
-- Name: EdCentreHead_tele_no_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "EdCentreHead_tele_no_key" ON public."EdCentreHead" USING btree (tele_no);


--
-- Name: GroupDepartment_d_name_centre_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "GroupDepartment_d_name_centre_id_key" ON public."GroupDepartment" USING btree (d_name, centre_id);


--
-- Name: HodHpcIandE_email_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "HodHpcIandE_email_id_key" ON public."HodHpcIandE" USING btree (email_id);


--
-- Name: HodHpcIandE_mob_no_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "HodHpcIandE_mob_no_key" ON public."HodHpcIandE" USING btree (mob_no);


--
-- Name: HodHpcIandE_tele_no_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "HodHpcIandE_tele_no_key" ON public."HodHpcIandE" USING btree (tele_no);


--
-- Name: Hod_email_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Hod_email_id_key" ON public."Hod" USING btree (email_id);


--
-- Name: Hod_grp_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Hod_grp_id_key" ON public."Hod" USING btree (grp_id);


--
-- Name: Hod_mob_no_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Hod_mob_no_key" ON public."Hod" USING btree (mob_no);


--
-- Name: Hod_tele_no_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Hod_tele_no_key" ON public."Hod" USING btree (tele_no);


--
-- Name: MemberNetops_centre_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "MemberNetops_centre_id_key" ON public."MemberNetops" USING btree (centre_id);


--
-- Name: MemberNetops_email_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "MemberNetops_email_id_key" ON public."MemberNetops" USING btree (email_id);


--
-- Name: MemberNetops_mob_no_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "MemberNetops_mob_no_key" ON public."MemberNetops" USING btree (mob_no);


--
-- Name: MemberNetops_tele_no_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "MemberNetops_tele_no_key" ON public."MemberNetops" USING btree (tele_no);


--
-- Name: ProjectAssignment_project_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ProjectAssignment_project_name_key" ON public."ProjectAssignment" USING btree (project_name);


--
-- Name: WebMaster_centre_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "WebMaster_centre_id_key" ON public."WebMaster" USING btree (centre_id);


--
-- Name: WebMaster_email_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "WebMaster_email_id_key" ON public."WebMaster" USING btree (email_id);


--
-- Name: WebMaster_mob_no_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "WebMaster_mob_no_key" ON public."WebMaster" USING btree (mob_no);


--
-- Name: WebMaster_tele_no_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "WebMaster_tele_no_key" ON public."WebMaster" USING btree (tele_no);


--
-- Name: AppUser AppUser_centre_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AppUser"
    ADD CONSTRAINT "AppUser_centre_id_fkey" FOREIGN KEY (centre_id) REFERENCES public."Centre"(centre_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Arm Arm_centre_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Arm"
    ADD CONSTRAINT "Arm_centre_id_fkey" FOREIGN KEY (centre_id) REFERENCES public."Centre"(centre_id) ON DELETE CASCADE;


--
-- Name: Arm Arm_emp_no_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Arm"
    ADD CONSTRAINT "Arm_emp_no_fkey" FOREIGN KEY (emp_no) REFERENCES public."AppUser"(emp_no) ON DELETE CASCADE;


--
-- Name: Arm Arm_grp_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Arm"
    ADD CONSTRAINT "Arm_grp_id_fkey" FOREIGN KEY (grp_id) REFERENCES public."GroupDepartment"(dept_id) ON DELETE CASCADE;


--
-- Name: Centre Centre_netops_red_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Centre"
    ADD CONSTRAINT "Centre_netops_red_fkey" FOREIGN KEY (netops_red) REFERENCES public."MemberNetops"(emp_no) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Drm Drm_centre_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Drm"
    ADD CONSTRAINT "Drm_centre_id_fkey" FOREIGN KEY (centre_id) REFERENCES public."Centre"(centre_id) ON DELETE CASCADE;


--
-- Name: Drm Drm_emp_no_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Drm"
    ADD CONSTRAINT "Drm_emp_no_fkey" FOREIGN KEY (emp_no) REFERENCES public."AppUser"(emp_no) ON DELETE CASCADE;


--
-- Name: Drm Drm_grp_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Drm"
    ADD CONSTRAINT "Drm_grp_id_fkey" FOREIGN KEY (grp_id) REFERENCES public."GroupDepartment"(dept_id) ON DELETE CASCADE;


--
-- Name: EdCentreHead EdCentreHead_centre_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EdCentreHead"
    ADD CONSTRAINT "EdCentreHead_centre_id_fkey" FOREIGN KEY (centre_id) REFERENCES public."Centre"(centre_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: GroupDepartment GroupDepartment_centre_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GroupDepartment"
    ADD CONSTRAINT "GroupDepartment_centre_id_fkey" FOREIGN KEY (centre_id) REFERENCES public."Centre"(centre_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Hod Hod_centre_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Hod"
    ADD CONSTRAINT "Hod_centre_id_fkey" FOREIGN KEY (centre_id) REFERENCES public."Centre"(centre_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Hod Hod_grp_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Hod"
    ADD CONSTRAINT "Hod_grp_id_fkey" FOREIGN KEY (grp_id) REFERENCES public."GroupDepartment"(dept_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MemberNetops MemberNetops_centre_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MemberNetops"
    ADD CONSTRAINT "MemberNetops_centre_id_fkey" FOREIGN KEY (centre_id) REFERENCES public."Centre"(centre_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProjectAssignment ProjectAssignment_hod_emp_no_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProjectAssignment"
    ADD CONSTRAINT "ProjectAssignment_hod_emp_no_fkey" FOREIGN KEY (hod_emp_no) REFERENCES public."Hod"(emp_no) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WebMaster WebMaster_centre_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WebMaster"
    ADD CONSTRAINT "WebMaster_centre_id_fkey" FOREIGN KEY (centre_id) REFERENCES public."Centre"(centre_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

