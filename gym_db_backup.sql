--
-- PostgreSQL database dump
--

\restrict K09NPXdBdKc86nvXKnXotW2p0QvB1FPa936C6a03TrJLsAAmYE6es8obaYR7rvG

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: check_ins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.check_ins (
    id integer NOT NULL,
    "checkInTime" timestamp without time zone DEFAULT now() NOT NULL,
    "memberId" integer,
    "gymId" integer
);


ALTER TABLE public.check_ins OWNER TO postgres;

--
-- Name: check_ins_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.check_ins_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.check_ins_id_seq OWNER TO postgres;

--
-- Name: check_ins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.check_ins_id_seq OWNED BY public.check_ins.id;


--
-- Name: enrollments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.enrollments (
    id integer NOT NULL,
    "startDate" timestamp without time zone NOT NULL,
    "endDate" timestamp without time zone NOT NULL,
    status character varying DEFAULT 'active'::character varying NOT NULL,
    "amountPaid" numeric(10,2) NOT NULL,
    "memberId" integer,
    "planId" integer,
    "gymId" integer,
    "totalPtSessions" integer DEFAULT 0 NOT NULL,
    "remainingPtSessions" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.enrollments OWNER TO postgres;

--
-- Name: enrollments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.enrollments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.enrollments_id_seq OWNER TO postgres;

--
-- Name: enrollments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.enrollments_id_seq OWNED BY public.enrollments.id;


--
-- Name: exercises; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exercises (
    id integer NOT NULL,
    name character varying NOT NULL,
    description character varying,
    category character varying NOT NULL,
    equipment character varying,
    sets integer DEFAULT 3 NOT NULL,
    reps integer DEFAULT 12 NOT NULL,
    "videoUrl" character varying,
    "muscleGroup" character varying,
    "goalType" character varying DEFAULT 'both'::character varying NOT NULL,
    "gymId" integer
);


ALTER TABLE public.exercises OWNER TO postgres;

--
-- Name: exercises_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.exercises_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exercises_id_seq OWNER TO postgres;

--
-- Name: exercises_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.exercises_id_seq OWNED BY public.exercises.id;


--
-- Name: fitness_programs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fitness_programs (
    id integer NOT NULL,
    goal character varying NOT NULL,
    "startWeightKg" integer NOT NULL,
    "targetWeightKg" integer NOT NULL,
    "durationWeeks" integer NOT NULL,
    "startDate" date NOT NULL,
    "endDate" date NOT NULL,
    "dailyCalories" integer NOT NULL,
    "proteinG" integer NOT NULL,
    "fatG" integer NOT NULL,
    "carbsG" integer NOT NULL,
    "workoutPlan" jsonb NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "userId" integer,
    warnings jsonb DEFAULT '[]'::jsonb NOT NULL,
    "gymId" integer,
    "dietPlan" jsonb
);


ALTER TABLE public.fitness_programs OWNER TO postgres;

--
-- Name: fitness_programs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.fitness_programs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.fitness_programs_id_seq OWNER TO postgres;

--
-- Name: fitness_programs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.fitness_programs_id_seq OWNED BY public.fitness_programs.id;


--
-- Name: gyms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gyms (
    id integer NOT NULL,
    name character varying NOT NULL,
    address character varying,
    phone character varying,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.gyms OWNER TO postgres;

--
-- Name: gyms_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.gyms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.gyms_id_seq OWNER TO postgres;

--
-- Name: gyms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.gyms_id_seq OWNED BY public.gyms.id;


--
-- Name: health_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.health_profiles (
    id integer NOT NULL,
    "heightCm" numeric(5,2) NOT NULL,
    "weightKg" numeric(5,2) NOT NULL,
    age integer NOT NULL,
    gender character varying NOT NULL,
    "targetWeightKg" numeric(5,2) NOT NULL,
    "weeklyWorkoutDays" integer NOT NULL,
    "activityLevel" character varying DEFAULT 'moderate'::character varying NOT NULL,
    "bodyFatPercentage" numeric(5,2),
    "userId" integer,
    "gymId" integer
);


ALTER TABLE public.health_profiles OWNER TO postgres;

--
-- Name: health_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.health_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.health_profiles_id_seq OWNER TO postgres;

--
-- Name: health_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.health_profiles_id_seq OWNED BY public.health_profiles.id;


--
-- Name: membership_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.membership_plans (
    id integer NOT NULL,
    name character varying NOT NULL,
    "durationMonths" integer NOT NULL,
    price numeric(10,2) NOT NULL,
    description character varying,
    "isActive" boolean DEFAULT true NOT NULL,
    "includesPersonalTraining" boolean DEFAULT false NOT NULL,
    "gymId" integer,
    "ptSessionsCount" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.membership_plans OWNER TO postgres;

--
-- Name: membership_plans_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.membership_plans_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.membership_plans_id_seq OWNER TO postgres;

--
-- Name: membership_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.membership_plans_id_seq OWNED BY public.membership_plans.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    "senderId" integer NOT NULL,
    "recipientId" integer NOT NULL,
    content text NOT NULL,
    "readAt" timestamp without time zone,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_id_seq OWNER TO postgres;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: program_exercises; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.program_exercises (
    "programId" integer NOT NULL,
    "exerciseId" integer NOT NULL
);


ALTER TABLE public.program_exercises OWNER TO postgres;

--
-- Name: program_ratings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.program_ratings (
    id integer NOT NULL,
    rating integer NOT NULL,
    comment text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "programId" integer,
    "userId" integer
);


ALTER TABLE public.program_ratings OWNER TO postgres;

--
-- Name: program_ratings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.program_ratings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.program_ratings_id_seq OWNER TO postgres;

--
-- Name: program_ratings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.program_ratings_id_seq OWNED BY public.program_ratings.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying NOT NULL,
    "fullName" character varying NOT NULL,
    password character varying NOT NULL,
    role text DEFAULT 'member'::text NOT NULL,
    phone character varying,
    "isActive" boolean DEFAULT true NOT NULL,
    "assignedTrainerId" integer,
    "qrToken" character varying,
    "gymId" integer,
    points integer DEFAULT 0 NOT NULL,
    badges text DEFAULT ''::text NOT NULL,
    "hideProfile" boolean DEFAULT false NOT NULL,
    "avatarUrl" character varying
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: workout_programs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workout_programs (
    id integer NOT NULL,
    name character varying NOT NULL,
    description character varying,
    difficulty character varying NOT NULL,
    "weeksCount" integer DEFAULT 4 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    category character varying DEFAULT 'full_body'::character varying NOT NULL,
    source character varying DEFAULT 'trainer'::character varying NOT NULL,
    "authorId" integer
);


ALTER TABLE public.workout_programs OWNER TO postgres;

--
-- Name: workout_programs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.workout_programs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.workout_programs_id_seq OWNER TO postgres;

--
-- Name: workout_programs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.workout_programs_id_seq OWNED BY public.workout_programs.id;


--
-- Name: check_ins id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.check_ins ALTER COLUMN id SET DEFAULT nextval('public.check_ins_id_seq'::regclass);


--
-- Name: enrollments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments ALTER COLUMN id SET DEFAULT nextval('public.enrollments_id_seq'::regclass);


--
-- Name: exercises id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercises ALTER COLUMN id SET DEFAULT nextval('public.exercises_id_seq'::regclass);


--
-- Name: fitness_programs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fitness_programs ALTER COLUMN id SET DEFAULT nextval('public.fitness_programs_id_seq'::regclass);


--
-- Name: gyms id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gyms ALTER COLUMN id SET DEFAULT nextval('public.gyms_id_seq'::regclass);


--
-- Name: health_profiles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.health_profiles ALTER COLUMN id SET DEFAULT nextval('public.health_profiles_id_seq'::regclass);


--
-- Name: membership_plans id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membership_plans ALTER COLUMN id SET DEFAULT nextval('public.membership_plans_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: program_ratings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.program_ratings ALTER COLUMN id SET DEFAULT nextval('public.program_ratings_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: workout_programs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_programs ALTER COLUMN id SET DEFAULT nextval('public.workout_programs_id_seq'::regclass);


--
-- Data for Name: check_ins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.check_ins (id, "checkInTime", "memberId", "gymId") FROM stdin;
1	2026-07-03 10:13:09.454931	4	1
2	2026-07-03 10:40:37.816096	3	1
3	2026-07-16 12:05:38.574648	3	1
4	2026-07-16 12:08:53.341266	3	1
\.


--
-- Data for Name: enrollments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.enrollments (id, "startDate", "endDate", status, "amountPaid", "memberId", "planId", "gymId", "totalPtSessions", "remainingPtSessions") FROM stdin;
2	2026-07-01 16:52:21.042	2026-08-01 16:52:21.042	active	499.00	4	1	1	0	0
5	2026-07-07 12:06:10.16	2027-07-07 12:06:10.16	active	18000.00	3	3	1	100	98
\.


--
-- Data for Name: exercises; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.exercises (id, name, description, category, equipment, sets, reps, "videoUrl", "muscleGroup", "goalType", "gymId") FROM stdin;
1	Bench Press	Barbell ile göğüs presi	strength	Barbell	4	8	\N	göğüs	gain	1
2	Dumbbell Fly	Dumbbell ile göğüs açış	strength	Dumbbell	3	12	\N	göğüs	both	1
3	Push Up	Vücut ağırlığıyla şınav	strength	Yok	3	15	\N	göğüs	lose	1
4	Deadlift	Barbell ile ölü kaldırış	strength	Barbell	4	6	\N	sırt	gain	1
5	Lat Pulldown	Makinede sırt çekişi	strength	Makine	3	12	\N	sırt	both	1
6	Pull Up	Barfiks	strength	Barfiks	3	8	\N	sırt	gain	1
7	Squat	Barbell ile çömelme	strength	Barbell	4	8	\N	bacak	gain	1
8	Leg Press	Makinede bacak presi	strength	Makine	3	12	\N	bacak	both	1
9	Lunges	Öne adım çömelme	strength	Dumbbell	3	12	\N	bacak	lose	1
10	Shoulder Press	Dumbbell ile omuz presi	strength	Dumbbell	4	10	\N	omuz	gain	1
11	Lateral Raise	Yana omuz kaldırış	strength	Dumbbell	3	15	\N	omuz	both	1
12	Bicep Curl	Dumbbell ile biceps	strength	Dumbbell	3	12	\N	kol	gain	1
13	Tricep Dips	Triceps için dips	strength	Yok	3	12	\N	kol	both	1
14	Plank	Karın için plank (saniye)	balance	Yok	3	60	\N	karın	both	1
15	Crunches	Mekik	strength	Yok	3	20	\N	karın	lose	1
16	Treadmill Run	Koşu bandı (dakika)	cardio	Koşu bandı	1	30	\N	tüm vücut	lose	1
17	Jump Rope	İp atlama (dakika)	cardio	İp	3	5	\N	tüm vücut	lose	1
18	Burpees	Tüm vücut patlayıcı hareket	cardio	Yok	3	15	\N	tüm vücut	lose	1
21	Hammer Curl		strength	Dumbell	3	10	\N	\N	both	2
\.


--
-- Data for Name: fitness_programs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fitness_programs (id, goal, "startWeightKg", "targetWeightKg", "durationWeeks", "startDate", "endDate", "dailyCalories", "proteinG", "fatG", "carbsG", "workoutPlan", "isActive", "createdAt", "userId", warnings, "gymId", "dietPlan") FROM stdin;
1	gain	70	75	15	2026-07-01	2026-10-14	3023	140	84	427	[{"day": 1, "focus": "Göğüs & Kol", "exercises": [{"id": 1, "name": "Bench Press", "reps": 8, "sets": 4, "goalType": "gain", "equipment": "Barbell", "muscleGroup": "göğüs"}, {"id": 2, "name": "Dumbbell Fly", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Dumbbell", "muscleGroup": "göğüs"}, {"id": 12, "name": "Bicep Curl", "reps": 12, "sets": 3, "goalType": "gain", "equipment": "Dumbbell", "muscleGroup": "kol"}, {"id": 13, "name": "Tricep Dips", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Yok", "muscleGroup": "kol"}]}, {"day": 2, "focus": "Sırt", "exercises": [{"id": 4, "name": "Deadlift", "reps": 6, "sets": 4, "goalType": "gain", "equipment": "Barbell", "muscleGroup": "sırt"}, {"id": 5, "name": "Lat Pulldown", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Makine", "muscleGroup": "sırt"}]}, {"day": 3, "focus": "Bacak & Karın", "exercises": [{"id": 7, "name": "Squat", "reps": 8, "sets": 4, "goalType": "gain", "equipment": "Barbell", "muscleGroup": "bacak"}, {"id": 8, "name": "Leg Press", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Makine", "muscleGroup": "bacak"}, {"id": 14, "name": "Plank", "reps": 60, "sets": 3, "goalType": "both", "equipment": "Yok", "muscleGroup": "karın"}]}, {"day": 4, "focus": "Omuz & Kardiyo", "exercises": [{"id": 10, "name": "Shoulder Press", "reps": 10, "sets": 4, "goalType": "gain", "equipment": "Dumbbell", "muscleGroup": "omuz"}, {"id": 11, "name": "Lateral Raise", "reps": 15, "sets": 3, "goalType": "both", "equipment": "Dumbbell", "muscleGroup": "omuz"}]}]	f	2026-07-01 10:41:04.727885	1	[]	\N	\N
2	gain	70	78	23	2026-07-01	2026-12-09	3023	140	84	427	[{"day": 1, "focus": "Göğüs & Kol", "exercises": [{"id": 1, "name": "Bench Press", "reps": 8, "sets": 4, "goalType": "gain", "equipment": "Barbell", "muscleGroup": "göğüs"}, {"id": 2, "name": "Dumbbell Fly", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Dumbbell", "muscleGroup": "göğüs"}, {"id": 12, "name": "Bicep Curl", "reps": 12, "sets": 3, "goalType": "gain", "equipment": "Dumbbell", "muscleGroup": "kol"}, {"id": 13, "name": "Tricep Dips", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Yok", "muscleGroup": "kol"}]}, {"day": 2, "focus": "Sırt", "exercises": [{"id": 4, "name": "Deadlift", "reps": 6, "sets": 4, "goalType": "gain", "equipment": "Barbell", "muscleGroup": "sırt"}, {"id": 5, "name": "Lat Pulldown", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Makine", "muscleGroup": "sırt"}]}, {"day": 3, "focus": "Bacak & Karın", "exercises": [{"id": 7, "name": "Squat", "reps": 8, "sets": 4, "goalType": "gain", "equipment": "Barbell", "muscleGroup": "bacak"}, {"id": 8, "name": "Leg Press", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Makine", "muscleGroup": "bacak"}, {"id": 14, "name": "Plank", "reps": 60, "sets": 3, "goalType": "both", "equipment": "Yok", "muscleGroup": "karın"}]}, {"day": 4, "focus": "Omuz & Kardiyo", "exercises": [{"id": 10, "name": "Shoulder Press", "reps": 10, "sets": 4, "goalType": "gain", "equipment": "Dumbbell", "muscleGroup": "omuz"}, {"id": 11, "name": "Lateral Raise", "reps": 15, "sets": 3, "goalType": "both", "equipment": "Dumbbell", "muscleGroup": "omuz"}]}]	f	2026-07-01 11:13:11.347812	1	[]	\N	\N
3	lose	70	50	29	2026-07-01	2027-01-20	2123	140	59	258	[{"day": 1, "focus": "Göğüs & Kol", "exercises": [{"id": 2, "name": "Dumbbell Fly", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Dumbbell", "muscleGroup": "göğüs"}, {"id": 3, "name": "Push Up", "reps": 15, "sets": 3, "goalType": "lose", "equipment": "Yok", "muscleGroup": "göğüs"}, {"id": 13, "name": "Tricep Dips", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Yok", "muscleGroup": "kol"}]}, {"day": 2, "focus": "Sırt", "exercises": [{"id": 5, "name": "Lat Pulldown", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Makine", "muscleGroup": "sırt"}]}, {"day": 3, "focus": "Bacak & Karın", "exercises": [{"id": 8, "name": "Leg Press", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Makine", "muscleGroup": "bacak"}, {"id": 9, "name": "Lunges", "reps": 12, "sets": 3, "goalType": "lose", "equipment": "Dumbbell", "muscleGroup": "bacak"}, {"id": 14, "name": "Plank", "reps": 60, "sets": 3, "goalType": "both", "equipment": "Yok", "muscleGroup": "karın"}, {"id": 15, "name": "Crunches", "reps": 20, "sets": 3, "goalType": "lose", "equipment": "Yok", "muscleGroup": "karın"}]}, {"day": 4, "focus": "Omuz & Kardiyo", "exercises": [{"id": 11, "name": "Lateral Raise", "reps": 15, "sets": 3, "goalType": "both", "equipment": "Dumbbell", "muscleGroup": "omuz"}, {"id": 16, "name": "Treadmill Run", "reps": 30, "sets": 1, "goalType": "lose", "equipment": "Koşu bandı", "muscleGroup": "tüm vücut"}, {"id": 17, "name": "Jump Rope", "reps": 5, "sets": 3, "goalType": "lose", "equipment": "İp", "muscleGroup": "tüm vücut"}]}]	t	2026-07-01 11:31:49.041754	1	[{"type": "target_too_low", "message": "Hedef kilonuz (50 kg) sağlıklı aralığın altında. Boyunuz için sağlıklı aralık yaklaşık 58.6–78.9 kg. Bir sağlık uzmanına danışmanızı öneririz."}]	\N	\N
4	lose	95	85	15	2026-07-02	2026-10-15	2538	190	71	285	[{"day": 1, "focus": "Göğüs & Kol", "exercises": [{"id": 2, "name": "Dumbbell Fly", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Dumbbell", "muscleGroup": "göğüs"}, {"id": 3, "name": "Push Up", "reps": 15, "sets": 3, "goalType": "lose", "equipment": "Yok", "muscleGroup": "göğüs"}, {"id": 13, "name": "Tricep Dips", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Yok", "muscleGroup": "kol"}]}, {"day": 2, "focus": "Sırt", "exercises": [{"id": 5, "name": "Lat Pulldown", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Makine", "muscleGroup": "sırt"}]}, {"day": 3, "focus": "Bacak & Karın", "exercises": [{"id": 8, "name": "Leg Press", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Makine", "muscleGroup": "bacak"}, {"id": 9, "name": "Lunges", "reps": 12, "sets": 3, "goalType": "lose", "equipment": "Dumbbell", "muscleGroup": "bacak"}, {"id": 14, "name": "Plank", "reps": 60, "sets": 3, "goalType": "both", "equipment": "Yok", "muscleGroup": "karın"}, {"id": 15, "name": "Crunches", "reps": 20, "sets": 3, "goalType": "lose", "equipment": "Yok", "muscleGroup": "karın"}]}, {"day": 4, "focus": "Omuz & Kardiyo", "exercises": [{"id": 11, "name": "Lateral Raise", "reps": 15, "sets": 3, "goalType": "both", "equipment": "Dumbbell", "muscleGroup": "omuz"}, {"id": 16, "name": "Treadmill Run", "reps": 30, "sets": 1, "goalType": "lose", "equipment": "Koşu bandı", "muscleGroup": "tüm vücut"}, {"id": 17, "name": "Jump Rope", "reps": 5, "sets": 3, "goalType": "lose", "equipment": "İp", "muscleGroup": "tüm vücut"}]}]	f	2026-07-02 10:17:26.027441	3	[{"type": "target_too_high", "message": "Hedef kilonuz (85 kg) sağlıklı aralığın üstünde. Boyunuz için sağlıklı aralık yaklaşık 59.9–80.7 kg. Bir sağlık uzmanına danışmanızı öneririz."}]	\N	\N
5	lose	95	85	15	2026-07-03	2026-10-16	2538	190	71	285	[{"day": 1, "focus": "Göğüs & Kol", "exercises": [{"id": 2, "name": "Dumbbell Fly", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Dumbbell", "muscleGroup": "göğüs"}, {"id": 3, "name": "Push Up", "reps": 15, "sets": 3, "goalType": "lose", "equipment": "Yok", "muscleGroup": "göğüs"}, {"id": 13, "name": "Tricep Dips", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Yok", "muscleGroup": "kol"}]}, {"day": 2, "focus": "Sırt", "exercises": [{"id": 5, "name": "Lat Pulldown", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Makine", "muscleGroup": "sırt"}]}, {"day": 3, "focus": "Bacak & Karın", "exercises": [{"id": 8, "name": "Leg Press", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Makine", "muscleGroup": "bacak"}, {"id": 9, "name": "Lunges", "reps": 12, "sets": 3, "goalType": "lose", "equipment": "Dumbbell", "muscleGroup": "bacak"}, {"id": 14, "name": "Plank", "reps": 60, "sets": 3, "goalType": "both", "equipment": "Yok", "muscleGroup": "karın"}, {"id": 15, "name": "Crunches", "reps": 20, "sets": 3, "goalType": "lose", "equipment": "Yok", "muscleGroup": "karın"}]}, {"day": 4, "focus": "Omuz & Kardiyo", "exercises": [{"id": 11, "name": "Lateral Raise", "reps": 15, "sets": 3, "goalType": "both", "equipment": "Dumbbell", "muscleGroup": "omuz"}, {"id": 16, "name": "Treadmill Run", "reps": 30, "sets": 1, "goalType": "lose", "equipment": "Koşu bandı", "muscleGroup": "tüm vücut"}, {"id": 17, "name": "Jump Rope", "reps": 5, "sets": 3, "goalType": "lose", "equipment": "İp", "muscleGroup": "tüm vücut"}]}]	f	2026-07-03 15:08:49.713213	3	[{"type": "target_too_high", "message": "Hedef kilonuz (85 kg) sağlıklı aralığın üstünde. Boyunuz için sağlıklı aralık yaklaşık 59.9–80.7 kg. Bir sağlık uzmanına danışmanızı öneririz."}]	\N	\N
6	lose	95	85	15	2026-07-03	2026-10-16	2538	190	71	285	[{"day": 1, "focus": "Göğüs & Kol", "exercises": [{"id": 2, "name": "Dumbbell Fly", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Dumbbell", "muscleGroup": "göğüs"}, {"id": 3, "name": "Push Up", "reps": 15, "sets": 3, "goalType": "lose", "equipment": "Yok", "muscleGroup": "göğüs"}, {"id": 13, "name": "Tricep Dips", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Yok", "muscleGroup": "kol"}]}, {"day": 2, "focus": "Sırt", "exercises": [{"id": 5, "name": "Lat Pulldown", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Makine", "muscleGroup": "sırt"}]}, {"day": 3, "focus": "Bacak & Karın", "exercises": [{"id": 8, "name": "Leg Press", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Makine", "muscleGroup": "bacak"}, {"id": 9, "name": "Lunges", "reps": 12, "sets": 3, "goalType": "lose", "equipment": "Dumbbell", "muscleGroup": "bacak"}, {"id": 14, "name": "Plank", "reps": 60, "sets": 3, "goalType": "both", "equipment": "Yok", "muscleGroup": "karın"}, {"id": 15, "name": "Crunches", "reps": 20, "sets": 3, "goalType": "lose", "equipment": "Yok", "muscleGroup": "karın"}]}, {"day": 4, "focus": "Omuz & Kardiyo", "exercises": [{"id": 11, "name": "Lateral Raise", "reps": 15, "sets": 3, "goalType": "both", "equipment": "Dumbbell", "muscleGroup": "omuz"}, {"id": 16, "name": "Treadmill Run", "reps": 30, "sets": 1, "goalType": "lose", "equipment": "Koşu bandı", "muscleGroup": "tüm vücut"}, {"id": 17, "name": "Jump Rope", "reps": 5, "sets": 3, "goalType": "lose", "equipment": "İp", "muscleGroup": "tüm vücut"}]}]	f	2026-07-03 15:13:04.537823	3	[{"type": "target_too_high", "message": "Hedef kilonuz (85 kg) sağlıklı aralığın üstünde. Boyunuz için sağlıklı aralık yaklaşık 59.9–80.7 kg. Bir sağlık uzmanına danışmanızı öneririz."}]	\N	\N
7	lose	95	85	15	2026-07-03	2026-10-16	2538	190	71	285	[{"day": 1, "focus": "Göğüs & Kol", "exercises": [{"id": 2, "name": "Dumbbell Fly", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Dumbbell", "muscleGroup": "göğüs"}, {"id": 3, "name": "Push Up", "reps": 15, "sets": 3, "goalType": "lose", "equipment": "Yok", "muscleGroup": "göğüs"}, {"id": 13, "name": "Tricep Dips", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Yok", "muscleGroup": "kol"}]}, {"day": 2, "focus": "Sırt", "exercises": [{"id": 5, "name": "Lat Pulldown", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Makine", "muscleGroup": "sırt"}]}, {"day": 3, "focus": "Bacak & Karın", "exercises": [{"id": 8, "name": "Leg Press", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Makine", "muscleGroup": "bacak"}, {"id": 9, "name": "Lunges", "reps": 12, "sets": 3, "goalType": "lose", "equipment": "Dumbbell", "muscleGroup": "bacak"}, {"id": 14, "name": "Plank", "reps": 60, "sets": 3, "goalType": "both", "equipment": "Yok", "muscleGroup": "karın"}, {"id": 15, "name": "Crunches", "reps": 20, "sets": 3, "goalType": "lose", "equipment": "Yok", "muscleGroup": "karın"}]}, {"day": 4, "focus": "Omuz & Kardiyo", "exercises": [{"id": 11, "name": "Lateral Raise", "reps": 15, "sets": 3, "goalType": "both", "equipment": "Dumbbell", "muscleGroup": "omuz"}, {"id": 16, "name": "Treadmill Run", "reps": 30, "sets": 1, "goalType": "lose", "equipment": "Koşu bandı", "muscleGroup": "tüm vücut"}, {"id": 17, "name": "Jump Rope", "reps": 5, "sets": 3, "goalType": "lose", "equipment": "İp", "muscleGroup": "tüm vücut"}]}]	f	2026-07-03 15:15:30.970329	3	[{"type": "target_too_high", "message": "Hedef kilonuz (85 kg) sağlıklı aralığın üstünde. Boyunuz için sağlıklı aralık yaklaşık 59.9–80.7 kg. Bir sağlık uzmanına danışmanızı öneririz."}]	\N	\N
8	lose	95	85	15	2026-07-09	2026-10-22	2538	190	71	285	[{"day": 1, "focus": "Göğüs & Kol", "exercises": [{"id": 2, "name": "Dumbbell Fly", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Dumbbell", "muscleGroup": "göğüs"}, {"id": 3, "name": "Push Up", "reps": 15, "sets": 3, "goalType": "lose", "equipment": "Yok", "muscleGroup": "göğüs"}, {"id": 13, "name": "Tricep Dips", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Yok", "muscleGroup": "kol"}]}, {"day": 2, "focus": "Sırt", "exercises": [{"id": 5, "name": "Lat Pulldown", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Makine", "muscleGroup": "sırt"}]}, {"day": 3, "focus": "Bacak & Karın", "exercises": [{"id": 8, "name": "Leg Press", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Makine", "muscleGroup": "bacak"}, {"id": 9, "name": "Lunges", "reps": 12, "sets": 3, "goalType": "lose", "equipment": "Dumbbell", "muscleGroup": "bacak"}, {"id": 14, "name": "Plank", "reps": 60, "sets": 3, "goalType": "both", "equipment": "Yok", "muscleGroup": "karın"}, {"id": 15, "name": "Crunches", "reps": 20, "sets": 3, "goalType": "lose", "equipment": "Yok", "muscleGroup": "karın"}]}, {"day": 4, "focus": "Omuz & Kardiyo", "exercises": [{"id": 11, "name": "Lateral Raise", "reps": 15, "sets": 3, "goalType": "both", "equipment": "Dumbbell", "muscleGroup": "omuz"}, {"id": 16, "name": "Treadmill Run", "reps": 30, "sets": 1, "goalType": "lose", "equipment": "Koşu bandı", "muscleGroup": "tüm vücut"}, {"id": 17, "name": "Jump Rope", "reps": 5, "sets": 3, "goalType": "lose", "equipment": "İp", "muscleGroup": "tüm vücut"}]}]	f	2026-07-09 09:59:03.384897	3	[{"type": "target_too_high", "message": "Hedef kilonuz (85 kg) sağlıklı aralığın üstünde. Boyunuz için sağlıklı aralık yaklaşık 59.9–80.7 kg. Bir sağlık uzmanına danışmanızı öneririz."}]	\N	\N
9	lose	95	85	15	2026-07-09	2026-10-22	2538	190	71	285	[{"day": 1, "focus": "Göğüs & Kol", "exercises": [{"id": 2, "name": "Dumbbell Fly", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Dumbbell", "muscleGroup": "göğüs"}, {"id": 3, "name": "Push Up", "reps": 15, "sets": 3, "goalType": "lose", "equipment": "Yok", "muscleGroup": "göğüs"}, {"id": 13, "name": "Tricep Dips", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Yok", "muscleGroup": "kol"}]}, {"day": 2, "focus": "Sırt", "exercises": [{"id": 5, "name": "Lat Pulldown", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Makine", "muscleGroup": "sırt"}]}, {"day": 3, "focus": "Bacak & Karın", "exercises": [{"id": 8, "name": "Leg Press", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Makine", "muscleGroup": "bacak"}, {"id": 9, "name": "Lunges", "reps": 12, "sets": 3, "goalType": "lose", "equipment": "Dumbbell", "muscleGroup": "bacak"}, {"id": 14, "name": "Plank", "reps": 60, "sets": 3, "goalType": "both", "equipment": "Yok", "muscleGroup": "karın"}, {"id": 15, "name": "Crunches", "reps": 20, "sets": 3, "goalType": "lose", "equipment": "Yok", "muscleGroup": "karın"}]}, {"day": 4, "focus": "Omuz & Kardiyo", "exercises": [{"id": 11, "name": "Lateral Raise", "reps": 15, "sets": 3, "goalType": "both", "equipment": "Dumbbell", "muscleGroup": "omuz"}, {"id": 16, "name": "Treadmill Run", "reps": 30, "sets": 1, "goalType": "lose", "equipment": "Koşu bandı", "muscleGroup": "tüm vücut"}, {"id": 17, "name": "Jump Rope", "reps": 5, "sets": 3, "goalType": "lose", "equipment": "İp", "muscleGroup": "tüm vücut"}]}]	f	2026-07-09 10:06:44.735498	3	[{"type": "target_too_high", "message": "Hedef kilonuz (85 kg) sağlıklı aralığın üstünde. Boyunuz için sağlıklı aralık yaklaşık 59.9–80.7 kg. Bir sağlık uzmanına danışmanızı öneririz."}]	\N	\N
11	gain	78	80	6	2026-07-09	2026-08-20	3167	156	88	438	[{"day": 1, "focus": "Göğüs ve Triceps", "exercises": [{"name": "Bench Press", "reps": 10, "sets": 4, "muscleGroup": "göğüs"}, {"name": "Incline Dumbbell Press", "reps": 12, "sets": 3, "muscleGroup": "göğüs"}, {"name": "Tricep Pushdown", "reps": 12, "sets": 3, "muscleGroup": "triceps"}, {"name": "Tricep Dips", "reps": 12, "sets": 3, "muscleGroup": "triceps"}]}, {"day": 2, "focus": "Sırt ve Biceps", "exercises": [{"name": "Pull-ups", "reps": 10, "sets": 3, "muscleGroup": "sırt"}, {"name": "Barbell Rows", "reps": 10, "sets": 4, "muscleGroup": "sırt"}, {"name": "Dumbbell Bicep Curls", "reps": 12, "sets": 3, "muscleGroup": "biceps"}, {"name": "Hammer Curls", "reps": 12, "sets": 3, "muscleGroup": "biceps"}]}, {"day": 3, "focus": "Bacaklar ve Omuzlar", "exercises": [{"name": "Squats", "reps": 10, "sets": 4, "muscleGroup": "bacaklar"}, {"name": "Leg Press", "reps": 12, "sets": 3, "muscleGroup": "bacaklar"}, {"name": "Standing Military Press", "reps": 10, "sets": 3, "muscleGroup": "omuzlar"}, {"name": "Lateral Raises", "reps": 12, "sets": 3, "muscleGroup": "omuzlar"}]}]	f	2026-07-09 11:05:04.102936	4	[]	\N	\N
12	gain	78	80	6	2026-07-09	2026-08-20	3167	156	88	438	[{"day": 1, "focus": "Göğüs ve Triceps", "exercises": [{"name": "Bench Press", "reps": 10, "sets": 4, "muscleGroup": "göğüs"}, {"name": "Incline Dumbbell Press", "reps": 12, "sets": 3, "muscleGroup": "göğüs"}, {"name": "Tricep Pushdown", "reps": 12, "sets": 3, "muscleGroup": "triceps"}, {"name": "Tricep Dips", "reps": 15, "sets": 3, "muscleGroup": "triceps"}]}, {"day": 2, "focus": "Sırt ve Biceps", "exercises": [{"name": "Pull-ups", "reps": 8, "sets": 3, "muscleGroup": "sırt"}, {"name": "Barbell Rows", "reps": 10, "sets": 4, "muscleGroup": "sırt"}, {"name": "Dumbbell Bicep Curls", "reps": 12, "sets": 3, "muscleGroup": "biceps"}, {"name": "Hammer Curls", "reps": 12, "sets": 3, "muscleGroup": "biceps"}]}, {"day": 3, "focus": "Bacaklar ve Omuzlar", "exercises": [{"name": "Squats", "reps": 10, "sets": 4, "muscleGroup": "bacaklar"}, {"name": "Leg Press", "reps": 12, "sets": 3, "muscleGroup": "bacaklar"}, {"name": "Standing Military Press", "reps": 10, "sets": 3, "muscleGroup": "omuzlar"}, {"name": "Lateral Raises", "reps": 12, "sets": 3, "muscleGroup": "omuzlar"}]}]	f	2026-07-09 11:12:45.56453	4	[]	\N	\N
10	lose	95	85	15	2026-07-09	2026-10-22	2538	190	71	285	[{"day": 1, "focus": "Göğüs & Kol", "exercises": [{"id": 2, "name": "Dumbbell Fly", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Dumbbell", "muscleGroup": "göğüs"}, {"id": 3, "name": "Push Up", "reps": 15, "sets": 3, "goalType": "lose", "equipment": "Yok", "muscleGroup": "göğüs"}, {"id": 13, "name": "Tricep Dips", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Yok", "muscleGroup": "kol"}]}, {"day": 2, "focus": "Sırt", "exercises": [{"id": 5, "name": "Lat Pulldown", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Makine", "muscleGroup": "sırt"}]}, {"day": 3, "focus": "Bacak & Karın", "exercises": [{"id": 8, "name": "Leg Press", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Makine", "muscleGroup": "bacak"}, {"id": 9, "name": "Lunges", "reps": 12, "sets": 3, "goalType": "lose", "equipment": "Dumbbell", "muscleGroup": "bacak"}, {"id": 14, "name": "Plank", "reps": 60, "sets": 3, "goalType": "both", "equipment": "Yok", "muscleGroup": "karın"}, {"id": 15, "name": "Crunches", "reps": 20, "sets": 3, "goalType": "lose", "equipment": "Yok", "muscleGroup": "karın"}]}, {"day": 4, "focus": "Omuz & Kardiyo", "exercises": [{"id": 11, "name": "Lateral Raise", "reps": 15, "sets": 3, "goalType": "both", "equipment": "Dumbbell", "muscleGroup": "omuz"}, {"id": 16, "name": "Treadmill Run", "reps": 30, "sets": 1, "goalType": "lose", "equipment": "Koşu bandı", "muscleGroup": "tüm vücut"}, {"id": 17, "name": "Jump Rope", "reps": 5, "sets": 3, "goalType": "lose", "equipment": "İp", "muscleGroup": "tüm vücut"}]}]	f	2026-07-09 10:14:23.549117	3	[{"type": "target_too_high", "message": "Hedef kilonuz (85 kg) sağlıklı aralığın üstünde. Boyunuz için sağlıklı aralık yaklaşık 59.9–80.7 kg. Bir sağlık uzmanına danışmanızı öneririz."}]	\N	\N
13	gain	78	80	4	2026-07-16	2026-08-13	3167	156	88	438	[{"day": 1, "focus": "Yeni Başlayan Full Body", "exercises": [{"id": 1, "name": "Bench Press", "reps": 8, "sets": 4, "goalType": "gain", "equipment": "Barbell", "muscleGroup": "göğüs"}, {"id": 2, "name": "Dumbbell Fly", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Dumbbell", "muscleGroup": "göğüs"}, {"id": 5, "name": "Lat Pulldown", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Makine", "muscleGroup": "sırt"}, {"id": 6, "name": "Pull Up", "reps": 8, "sets": 3, "goalType": "gain", "equipment": "Barfiks", "muscleGroup": "sırt"}, {"id": 7, "name": "Squat", "reps": 8, "sets": 4, "goalType": "gain", "equipment": "Barbell", "muscleGroup": "bacak"}, {"id": 8, "name": "Leg Press", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Makine", "muscleGroup": "bacak"}, {"id": 10, "name": "Shoulder Press", "reps": 10, "sets": 4, "goalType": "gain", "equipment": "Dumbbell", "muscleGroup": "omuz"}, {"id": 11, "name": "Lateral Raise", "reps": 15, "sets": 3, "goalType": "both", "equipment": "Dumbbell", "muscleGroup": "omuz"}, {"id": 12, "name": "Bicep Curl", "reps": 12, "sets": 3, "goalType": "gain", "equipment": "Dumbbell", "muscleGroup": "kol"}, {"id": 13, "name": "Tricep Dips", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Yok", "muscleGroup": "kol"}]}]	t	2026-07-16 11:56:21.107183	4	[]	1	\N
14	lose	95	85	4	2026-07-16	2026-08-13	2538	190	71	285	[{"day": 1, "focus": "Yeni Başlayan Full Body", "exercises": [{"id": 1, "name": "Bench Press", "reps": 8, "sets": 4, "goalType": "gain", "equipment": "Barbell", "muscleGroup": "göğüs"}, {"id": 2, "name": "Dumbbell Fly", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Dumbbell", "muscleGroup": "göğüs"}, {"id": 5, "name": "Lat Pulldown", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Makine", "muscleGroup": "sırt"}, {"id": 6, "name": "Pull Up", "reps": 8, "sets": 3, "goalType": "gain", "equipment": "Barfiks", "muscleGroup": "sırt"}, {"id": 7, "name": "Squat", "reps": 8, "sets": 4, "goalType": "gain", "equipment": "Barbell", "muscleGroup": "bacak"}, {"id": 8, "name": "Leg Press", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Makine", "muscleGroup": "bacak"}, {"id": 10, "name": "Shoulder Press", "reps": 10, "sets": 4, "goalType": "gain", "equipment": "Dumbbell", "muscleGroup": "omuz"}, {"id": 11, "name": "Lateral Raise", "reps": 15, "sets": 3, "goalType": "both", "equipment": "Dumbbell", "muscleGroup": "omuz"}, {"id": 12, "name": "Bicep Curl", "reps": 12, "sets": 3, "goalType": "gain", "equipment": "Dumbbell", "muscleGroup": "kol"}, {"id": 13, "name": "Tricep Dips", "reps": 12, "sets": 3, "goalType": "both", "equipment": "Yok", "muscleGroup": "kol"}]}]	t	2026-07-16 11:59:39.465375	3	[{"type": "target_too_high", "message": "Hedef kilonuz (85 kg) sağlıklı aralığın üstünde. Boyunuz için sağlıklı aralık yaklaşık 59.9–80.7 kg. Bir sağlık uzmanına danışmanızı öneririz."}]	1	{"meals": [{"name": "Kahvaltı", "time": "08:00", "items": ["2 adet haşlanmış yumurta", "40g süzme peynir", "1 dilim tam buğday ekmeği", "Domates, salatalık ve yeşillik"], "macros": {"fat": 18, "carbs": 20, "protein": 24}, "calories": 380}, {"name": "Öğle Yemeği", "time": "13:00", "items": ["120g ızgara tavuk göğsü", "100g haşlanmış pirinç", "100g buharda pişirilmiş brokoli", "1 orta boy elma"], "macros": {"fat": 10, "carbs": 60, "protein": 40}, "calories": 540}, {"name": "Ara Öğün", "time": "16:00", "items": ["1 orta boy muz", "20g badem"], "macros": {"fat": 8, "carbs": 30, "protein": 2}, "calories": 170}, {"name": "Akşam Yemeği", "time": "19:00", "items": ["120g ızgara somon", "100g haşlanmış karışık sebze", "1 dilim tam buğday ekmeği", "1 yemek kaşığı zeytinyağı"], "macros": {"fat": 25, "carbs": 20, "protein": 35}, "calories": 440}, {"name": "Gece Ara Öğün", "time": "22:00", "items": ["1 su bardağı light süt", "10g protein tozu"], "macros": {"fat": 0, "carbs": 10, "protein": 20}, "calories": 100}]}
\.


--
-- Data for Name: gyms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gyms (id, name, address, phone, "isActive", "createdAt") FROM stdin;
1	FitLife Kadıköy	Kadıköy, İstanbul	0216 000 00 00	t	2026-07-06 11:22:00.757991
2	FitLife Denizli	Pamukkale,Denizli	02580000000	t	2026-07-06 16:17:20.011467
\.


--
-- Data for Name: health_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.health_profiles (id, "heightCm", "weightKg", age, gender, "targetWeightKg", "weeklyWorkoutDays", "activityLevel", "bodyFatPercentage", "userId", "gymId") FROM stdin;
1	178.00	70.00	25	male	50.00	4	moderate	NaN	1	\N
2	180.00	95.00	24	male	85.00	4	moderate	\N	3	\N
3	180.00	78.00	25	male	80.00	3	moderate	\N	4	\N
\.


--
-- Data for Name: membership_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.membership_plans (id, name, "durationMonths", price, description, "isActive", "includesPersonalTraining", "gymId", "ptSessionsCount") FROM stdin;
1	Aylık Standart	1	499.00	\N	t	f	1	0
3	Yıllık Diamond	12	18000.00	\N	t	t	1	100
2	Aylık Premium	1	1499.00	\N	t	t	1	8
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, "senderId", "recipientId", content, "readAt", "createdAt") FROM stdin;
1	3	4	selam	2026-07-09 15:52:18.78	2026-07-09 15:52:15.28377
2	4	3	as	2026-07-09 15:52:25.755	2026-07-09 15:52:22.428
3	3	4	saddaf	2026-07-09 15:52:40.644	2026-07-09 15:52:30.105731
4	4	3	dfsaf	2026-07-09 15:52:42.788	2026-07-09 15:52:35.309673
5	1	6	selam	2026-07-16 11:48:59.084	2026-07-16 11:48:15.765835
6	6	1	as	2026-07-16 11:49:38.278	2026-07-16 11:49:07.742405
7	1	6	dsaffvga	2026-07-16 11:52:28.132	2026-07-16 11:49:47.504256
9	6	1	adsgad	\N	2026-07-16 11:52:33.471108
8	1	6	dasfa	2026-07-17 16:13:44.053	2026-07-16 11:52:31.039991
\.


--
-- Data for Name: program_exercises; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.program_exercises ("programId", "exerciseId") FROM stdin;
1	5
1	6
1	2
1	1
1	10
1	11
1	12
1	13
1	8
1	7
\.


--
-- Data for Name: program_ratings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.program_ratings (id, rating, comment, "createdAt", "programId", "userId") FROM stdin;
1	5	gayet iyi	2026-07-08 15:57:26.824153	1	3
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, "fullName", password, role, phone, "isActive", "assignedTrainerId", "qrToken", "gymId", points, badges, "hideProfile", "avatarUrl") FROM stdin;
6	kadikoy@salon.com	Ahmet Salon Sahibi	$2b$10$XpzckNO0UlD1xkqGMf3gwO6YD09hStAxdYXkR8GJXheimhp/OwQIi	admin	\N	t	\N	68aade2c2d5195140200502b90358fbc	1	0		f	\N
2	sarpdag@gmail.com	Berke Sarpdağ	$2b$10$LKnnvSSWo.jxMZ9gC7DxguGEAH8a6KH3fi7dbCkzaS9wLfK3l7csG	super_admin	05054717752	t	\N	18fe29723e9fcd5791ccf464c97ec542	\N	0		f	\N
7	furkan@gmail.com	Furkan Ürkmez	$2b$10$4h5ShR/gi.b.9XbYJdG/jOVK5sz9dKsTXNOYlp1L7Dj7LfrfHjvcC	admin	\N	t	\N	bf4ae39360d5f41916a1f257ee988bf2	2	0		f	\N
5	qrtest@test.com	QR Test Üye	$2b$10$VWNQTbwX.dbFo5FYa2j8z.WaGjS9.dB5RKnyEPQcSgEorwkko7Z6m	member	\N	t	\N	e3d2411240c79ab875679903e4275c5b	1	0		f	\N
1	ali@gmail.com	ali	$2b$10$OZ746xZx5MlVBjMUVVn.wuv7O0enLmdssSUcYfa230RppmFSQwcim	trainer	05555555555	t	\N	191ad5426e834fb485dc5863cd86807a	1	0		f	\N
4	ahmet@gmail.com	ahmet	$2b$10$dGcDsaywIgEmNNQ.LJEov.I5Bix6ROppgEM9pldgRW9YonObFa9hW	member	05555555553	t	\N	b0655db0ff27dfb7b9113818625276e5	1	0		f	/uploads/avatars/4-1783602474696.webp
3	mehmet@gmail.com	mehmet	$2b$10$3OljMHhRTMf3g7WZncUkqOT6Dz5heElL3z.kZBY29kY9IrGbvUK7K	member	05555555554	t	1	6630f665840a1ddae4ee41e54e8e1513	1	75	İlk Adım	f	/uploads/avatars/3-1783602517755.webp
\.


--
-- Data for Name: workout_programs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workout_programs (id, name, description, difficulty, "weeksCount", "isActive", category, source, "authorId") FROM stdin;
1	Yeni Başlayan Full Body	\N	beginner	4	t	full_body	trainer	1
\.


--
-- Name: check_ins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.check_ins_id_seq', 4, true);


--
-- Name: enrollments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.enrollments_id_seq', 5, true);


--
-- Name: exercises_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.exercises_id_seq', 21, true);


--
-- Name: fitness_programs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.fitness_programs_id_seq', 14, true);


--
-- Name: gyms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.gyms_id_seq', 2, true);


--
-- Name: health_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.health_profiles_id_seq', 3, true);


--
-- Name: membership_plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.membership_plans_id_seq', 4, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.messages_id_seq', 9, true);


--
-- Name: program_ratings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.program_ratings_id_seq', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 7, true);


--
-- Name: workout_programs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.workout_programs_id_seq', 13, true);


--
-- Name: messages PK_18325f38ae6de43878487eff986; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY (id);


--
-- Name: program_exercises PK_39f5cdf395eda1c9fc83c96b3c8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.program_exercises
    ADD CONSTRAINT "PK_39f5cdf395eda1c9fc83c96b3c8" PRIMARY KEY ("programId", "exerciseId");


--
-- Name: fitness_programs PK_783b1d62bcc951af0aacd1230d4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fitness_programs
    ADD CONSTRAINT "PK_783b1d62bcc951af0aacd1230d4" PRIMARY KEY (id);


--
-- Name: enrollments PK_7c0f752f9fb68bf6ed7367ab00f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT "PK_7c0f752f9fb68bf6ed7367ab00f" PRIMARY KEY (id);


--
-- Name: membership_plans PK_85ca9d6f4262a6bbff2a540c640; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membership_plans
    ADD CONSTRAINT "PK_85ca9d6f4262a6bbff2a540c640" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: health_profiles PK_bfcb0de64c3eaf755e66ebb2211; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.health_profiles
    ADD CONSTRAINT "PK_bfcb0de64c3eaf755e66ebb2211" PRIMARY KEY (id);


--
-- Name: exercises PK_c4c46f5fa89a58ba7c2d894e3c3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT "PK_c4c46f5fa89a58ba7c2d894e3c3" PRIMARY KEY (id);


--
-- Name: program_ratings PK_d653dbffa3cd8b66a337276efda; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.program_ratings
    ADD CONSTRAINT "PK_d653dbffa3cd8b66a337276efda" PRIMARY KEY (id);


--
-- Name: workout_programs PK_edea9670490ad037235eb88edc9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_programs
    ADD CONSTRAINT "PK_edea9670490ad037235eb88edc9" PRIMARY KEY (id);


--
-- Name: check_ins PK_fac7f27bc829a454ad477c13f62; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.check_ins
    ADD CONSTRAINT "PK_fac7f27bc829a454ad477c13f62" PRIMARY KEY (id);


--
-- Name: gyms PK_fe765086496cf3c8475652cddcb; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gyms
    ADD CONSTRAINT "PK_fe765086496cf3c8475652cddcb" PRIMARY KEY (id);


--
-- Name: health_profiles REL_8a9cdac733ef57d23f0474a27e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.health_profiles
    ADD CONSTRAINT "REL_8a9cdac733ef57d23f0474a27e" UNIQUE ("userId");


--
-- Name: users UQ_221314af186ce64c275e9bf21a2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_221314af186ce64c275e9bf21a2" UNIQUE ("qrToken");


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: program_ratings UQ_d3e0054fb63b159b36d394a7164; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.program_ratings
    ADD CONSTRAINT "UQ_d3e0054fb63b159b36d394a7164" UNIQUE ("programId", "userId");


--
-- Name: IDX_71fdecb1143cdcf1d507265b5e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_71fdecb1143cdcf1d507265b5e" ON public.program_exercises USING btree ("programId");


--
-- Name: IDX_f6be1e0f155a528dd8f922d558; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_f6be1e0f155a528dd8f922d558" ON public.program_exercises USING btree ("exerciseId");


--
-- Name: program_ratings FK_019e58254bb180448b90740e6e4; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.program_ratings
    ADD CONSTRAINT "FK_019e58254bb180448b90740e6e4" FOREIGN KEY ("programId") REFERENCES public.workout_programs(id) ON DELETE CASCADE;


--
-- Name: enrollments FK_28eb2e27d8c7f47d7064a1ba18f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT "FK_28eb2e27d8c7f47d7064a1ba18f" FOREIGN KEY ("planId") REFERENCES public.membership_plans(id);


--
-- Name: messages FK_2db9cf2b3ca111742793f6c37ce; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT "FK_2db9cf2b3ca111742793f6c37ce" FOREIGN KEY ("senderId") REFERENCES public.users(id);


--
-- Name: enrollments FK_3a133d50d4a14be30f82a557871; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT "FK_3a133d50d4a14be30f82a557871" FOREIGN KEY ("memberId") REFERENCES public.users(id);


--
-- Name: users FK_499423caa2a53303e5a5ac90d8d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "FK_499423caa2a53303e5a5ac90d8d" FOREIGN KEY ("assignedTrainerId") REFERENCES public.users(id);


--
-- Name: fitness_programs FK_4f3624a41f941d00ecd0534164b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fitness_programs
    ADD CONSTRAINT "FK_4f3624a41f941d00ecd0534164b" FOREIGN KEY ("userId") REFERENCES public.users(id);


--
-- Name: program_exercises FK_71fdecb1143cdcf1d507265b5e5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.program_exercises
    ADD CONSTRAINT "FK_71fdecb1143cdcf1d507265b5e5" FOREIGN KEY ("programId") REFERENCES public.workout_programs(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: health_profiles FK_8a9cdac733ef57d23f0474a27eb; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.health_profiles
    ADD CONSTRAINT "FK_8a9cdac733ef57d23f0474a27eb" FOREIGN KEY ("userId") REFERENCES public.users(id);


--
-- Name: program_ratings FK_9d7b3cc900350644bc506f8bf4d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.program_ratings
    ADD CONSTRAINT "FK_9d7b3cc900350644bc506f8bf4d" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: workout_programs FK_c21b2b91a4f633c2e4da142caf7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_programs
    ADD CONSTRAINT "FK_c21b2b91a4f633c2e4da142caf7" FOREIGN KEY ("authorId") REFERENCES public.users(id);


--
-- Name: users FK_c2eb2f3b7991ab4186947ebf6ad; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "FK_c2eb2f3b7991ab4186947ebf6ad" FOREIGN KEY ("gymId") REFERENCES public.gyms(id);


--
-- Name: check_ins FK_c48d2af7d01dde89d2a86fd11ab; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.check_ins
    ADD CONSTRAINT "FK_c48d2af7d01dde89d2a86fd11ab" FOREIGN KEY ("memberId") REFERENCES public.users(id);


--
-- Name: messages FK_f548818d46a1315d4e1d5e62da5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT "FK_f548818d46a1315d4e1d5e62da5" FOREIGN KEY ("recipientId") REFERENCES public.users(id);


--
-- Name: program_exercises FK_f6be1e0f155a528dd8f922d558d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.program_exercises
    ADD CONSTRAINT "FK_f6be1e0f155a528dd8f922d558d" FOREIGN KEY ("exerciseId") REFERENCES public.exercises(id);


--
-- PostgreSQL database dump complete
--

\unrestrict K09NPXdBdKc86nvXKnXotW2p0QvB1FPa936C6a03TrJLsAAmYE6es8obaYR7rvG

