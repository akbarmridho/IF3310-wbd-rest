# ListWibuKu - Rest

ListWibuKu Rest is a site that provide anime streaming service.

## Daftar Anggota

1. Akbar Maulana Ridho, 13521093
2. Eugene Yap Jin Quan, 13521074

## Requirement

1. Docker Installed

## Installation Guide

1. Clone repo
2. Inside the repository, run `docker compose up`
3. (Optional) run seeder on host computer with `npm run seed`

## How to Run

Make sure the docker container are up and running. Open the website on http://localhost:3000

## Bonus

- Caching. Used to cache anime, episode, and subscriber user (cache response from soap service). This is implemented
  with node-cache.

## Pembagian Tugas

| Tugas                                 | NIM      |
|---------------------------------------|----------|
| Authentication (login, register, etc) | 13521074 |
| Anime CRUD                            | 13521074 |
| Anime episodes CRUD                   | 13521093 |
| Episode streaming and viewer counter  | 13521093 |

