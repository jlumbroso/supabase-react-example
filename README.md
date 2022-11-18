# Supabase React User Management Template

This example will set you up for a very common situation: Users can sign up with a magic link and then update their account with public profile information, including a profile image.

This demonstrates how to use:

- User signups using Supabase [Auth](https://supabase.com/auth).
- User avatar images using Supabase [Storage](https://supabase.com/storage).
- Public profiles restricted with [Policies](https://supabase.com/docs/guides/auth#policies).
- Frontend using [Create React App](https://reactjs.org/docs/create-a-new-react-app.html).
- Deployment using [GitHub Actions](https://docs.github.com/en/actions) + hosting using [GitHub Pages](https://pages.github.com/).

_This example is originally [from the Supabase developers](https://github.com/supabase/supabase/tree/master/examples/user-management/react-user-management), and it was adapted by [**@jlumbroso**](https://github.com/jlumbroso) to be compiled through GitHub Actions and deployed to GitHub Pages, so that it could be made into a [GitHub Template](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository)._

## Technologies used

- Frontend:
  - [Create React App](https://reactjs.org/docs/create-a-new-react-app.html) - a React toolchain.
  - [Supabase.js](https://supabase.com/docs/library/getting-started) for user management and realtime data syncing.
- Backend:
  - [app.supabase.com](https://app.supabase.com/): hosted Postgres database with restful API for usage with Supabase.js.
- Deployment:
  - The code is compiled by [GitHub Actions](https://docs.github.com/en/actions) using the continuous integration in `.github/workflows`.
  - The website is hosted on [GitHub Pages](https://pages.github.com/), in the version available in the branch `gh-pages`.

## Fork your own copy of this project

### 1. Create your own instance of the repository

The repository `jlumbroso/supabase-react-example` is a template, and you can [create your own repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template) from it.

Note that the initial repository will contain this project, _but because the secrets are not configured yet, the deployment will either fail outright, or result in a broken website_. This is to be expected and will be resolved in the following steps.

### 2. Create a new Supabase project

Sign up to Supabase - [https://app.supabase.com](https://app.supabase.com) and create a new project. Wait for your database to start.

### 3. Run "User Management" Quickstart

Once your database has started, head over to your project's `SQL Editor` and run the "User Management Starter" quickstart. On the `SQL editor` page, scroll down until you see `User Management Starter: Sets up a public Profiles table which you can access with your API`. Click that, then click `RUN` to execute that query and create a new `profiles` table. When that's finished, head over to the `Table Editor` and see your new `profiles` table.

### 4. Get the URL and Key

Go to the Project Settings (the cog icon), open the API tab, and find your API URL and `anon` key, you'll need these in the next step.

The `anon` key is your client-side API key. It allows "anonymous access" to your database, until the user has logged in. Once they have logged in, the keys will switch to the user's own login token. This enables row level security for your data. Read more about this [below](#postgres-row-level-security).

![image](https://user-images.githubusercontent.com/10214025/88916245-528c2680-d298-11ea-8a71-708f93e1ce4f.png)

**_NOTE_**: The `service_role` key has full access to your data, bypassing any security policies. These keys have to be kept secret and are meant to be used in server environments and never on a client or browser.

### 5. Configure the secrets (and environment variables)

In the previous steps, you created a Supabase project with a database, and you created a `profiles` table. You also got the URL and key for your project. These are now going to be provided as configuration to the project.

For cloud deployment: Create [encrypted secrets for your repository](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository), using the following names:

- `REACT_APP_SUPABASE_URL` for the URL of your project.
- `REACT_APP_SUPABASE_ANON_KEY` for the `anon` key of your project.

### 6. Turn on GitHub Pages

In the repository settings, go to the `Pages` section, and [select the `gh-pages` branch as the source for the GitHub Pages website](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-from-a-branch). This will be the branch where the compiled code will be deployed.

### 7. Trigger the first deployment

Now that the secrets are configured, the first deployment will be triggered. This will take a few minutes, and you can check the progress in the `Actions` tab of the repository.

## Local development

If you ever want to locally develop this project, you can do so by following these steps.

### 1. Clone the repository

```bash
git clone https://github.com/<your username>/<your repository name>
```

### 2. Create the `.env` file

Inside the cloned repository, create a file `.env.local` with the following:

```
REACT_APP_SUPABASE_URL=
REACT_APP_SUPABASE_ANON_KEY=
```

where you complete the values with the URL and key of your project.

### 3. Install the dependencies of the project

This step will require that you have [some recent version of Node.js locally installed](https://nodejs.org/en/).

```bash
npm install
```

### 4. Run the project

```bash
npm run start
```

then open your browser to `https://localhost:3000/` and you are ready to go 🚀.

## Supabase details

### Postgres Row level security

This project uses very high-level Authorization using Postgres' Role Level Security.
When you start a Postgres database on Supabase, we populate it with an `auth` schema, and some helper functions.
When a user logs in, they are issued a JWT with the role `authenticated` and their UUID.
We can use these details to provide fine-grained control over what each user can and cannot do.

This is a trimmed-down schema, with the policies:

```sql
-- Create a table for Public Profiles
create table profiles (
  id uuid references auth.users not null,
  updated_at timestamp with time zone,
  username text unique,
  avatar_url text,
  website text,
  primary key (id),
  unique(username),
  constraint username_length check (char_length(username) >= 3)
);
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );
create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );
create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );
-- Set up Realtime!
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table profiles;
-- Set up Storage!
insert into storage.buckets (id, name)
values ('avatars', 'avatars');
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );
create policy "Anyone can upload an avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' );
```

## Authors

- [Supabase](https://supabase.com)
- [@jlumbroso](https://www.github.com/jlumbroso)

Supabase is open source. We'd love for you to follow along and get involved at https://github.com/supabase/supabase
