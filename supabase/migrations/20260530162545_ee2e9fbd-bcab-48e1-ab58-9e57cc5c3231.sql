
insert into storage.buckets (id, name, public)
values ('story-audio', 'story-audio', true)
on conflict (id) do update set public = true;

-- Allow public reads of objects in story-audio
create policy "Public read story-audio"
on storage.objects for select
to public
using (bucket_id = 'story-audio');
