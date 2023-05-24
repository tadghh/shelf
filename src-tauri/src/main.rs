#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
use std::sync::{Arc, Mutex};
use std::time::Instant;

use base64::{decode, encode};
use epub::doc::EpubDoc;
use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use std::fs::{File, OpenOptions};
use std::io::{BufReader, Read, Write};
use std::path::Path;
use std::{env, fs};

#[derive(Serialize, Deserialize, Debug)]
struct Book {
    cover_location: String,
    book_location: String,
    title: String,
}
struct BookCache {
    books: Option<Vec<Book>>,
    json_path: Option<String>,
}
impl BookCache {
    fn update_path(&mut self, new_json_path: String) {
        self.json_path = Some(new_json_path);
    }
    fn update_books(&mut self, new_books: Vec<Book>) {
        self.books = Some(new_books);
    }
}
static mut BOOK_JSON: BookCache = BookCache {
    books: None,
    json_path: None,
};

fn create_book_vec(items: &Vec<String>, write_directory: &String) -> Vec<Book> {
    let books: Vec<Book> = items
        .par_iter()
        .filter_map(|item| {
            let title = EpubDoc::new(&item).unwrap().mdata("title").unwrap();

            let new_book = Book {
                cover_location: create_cover(item.to_string(), write_directory),
                book_location: item.replace("\\", "/"),
                title,
            };

            Some(new_book)
        })
        .collect();

    let mut sorted_books = books;
    sorted_books.sort_by(|a, b| a.title.cmp(&b.title));

    sorted_books
}
#[tauri::command]
fn create_covers(dir: String) -> Vec<Book> {
    //file name to long
    let start_time = Instant::now();

    let paths = fs::read_dir(&dir);
    let mut book_json: Vec<Book>;
    let json_path = format!("{}/book_cache.json", &dir);
    unsafe {
        BOOK_JSON.update_path(format!("{}/book_cache.json", &dir));
    }
    let epubs: Vec<String> = paths
        .unwrap()
        .filter_map(|entry| {
            let path = entry.unwrap().path();
            if path.is_file() && path.extension().unwrap() == "epub" {
                Some(path.to_str().unwrap().to_owned())
            } else {
                None
            }
        })
        .collect();

    if Path::new(&json_path).exists() {
        let file = OpenOptions::new()
            .read(true)
            .write(true)
            .create(true)
            .open(&json_path);
        book_json = match serde_json::from_reader(BufReader::new(file.unwrap())) {
            Ok(data) => data,
            Err(_) => Vec::new(),
        };
        let book_json_test = Arc::new(Mutex::new(book_json));

        epubs.par_iter().for_each(|item| {
            let item_normalized = item.replace("\\", "/");
            let title = EpubDoc::new(&item_normalized)
                .unwrap()
                .mdata("title")
                .unwrap();

            let mut book_json_guard = book_json_test.lock().unwrap();
            let index = chunk_binary_search_index(&book_json_guard, &title);

            if !index.is_none() {
                let new_book = Book {
                    cover_location: create_cover(item_normalized.to_string(), &dir),
                    book_location: item_normalized,
                    title: title.clone(),
                };
                book_json_guard.insert(index.unwrap(), new_book);
            }
        });

        book_json = Arc::try_unwrap(book_json_test)
            .unwrap()
            .into_inner()
            .unwrap();
    } else {
        book_json = create_book_vec(&epubs, &dir);
    }

    let file = File::create(json_path).unwrap();
    serde_json::to_writer_pretty(file, &book_json);
    let elapsed_time = start_time.elapsed();
    println!("Execution time: {} ms", elapsed_time.as_millis());

    return book_json;
}
#[tauri::command]
fn load_book(title: String) -> Result<String, String> {
    unsafe {
        let open_file: &String = &BOOK_JSON.json_path.to_owned().unwrap();
        let mut book_json: Vec<Book>;
        println!("Yo here {}", open_file);
        if Path::new(&open_file).exists() {
            let file = OpenOptions::new()
                .read(true)
                .write(true)
                .create(true)
                .open(&open_file);
            println!("Yo hsssere {}", open_file);

            BOOK_JSON.update_books(
                match serde_json::from_reader(BufReader::new(file.unwrap())) {
                    Ok(data) => data,
                    Err(_) => Vec::new(),
                },
            );
            //  println!("Yo Index {:?}", &BOOK_JSON.books.take());
            let book_index =
                chunk_binary_search_index_load(&BOOK_JSON.books.take().unwrap(), &title);
            println!("Yo Index {:?}", book_index);

            if let Some(books) = &BOOK_JSON.books {
                if let Some(book) = books.get(book_index.unwrap()) {
                    // Accessing the book at the specified index
                    return Ok(book.book_location.to_string());
                } else {
                    println!("Invalid index");
                }
            }
        } else {
            return Err("JSON File missing".to_string());
        }
    }

    return Err("Error occured".to_string());
}
fn chunk_binary_search_index(dataset: &Vec<Book>, key: &String) -> Option<usize> {
    let title = key.to_string();
    //handel lower case
    let low = dataset.iter().position(|b| b.title[..1] == title[..1]);

    if let Some(index) = low {
        let mut high = dataset
            .iter()
            .rposition(|b| b.title[..1] == title[..1])
            .unwrap();
        let mut unwrapped_low = index;
        while unwrapped_low <= high {
            let mid = (unwrapped_low + high) / 2;
            if dataset[mid].title == title {
                return None;
            } else if dataset[mid].title < title {
                unwrapped_low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        Some(unwrapped_low)
    } else {
        Some(dataset.len())
    }
}
fn chunk_binary_search_index_load(dataset: &Vec<Book>, key: &String) -> Option<usize> {
    let title = key.to_string();
    //handel lower case
    let low = dataset.iter().position(|b| b.title[..1] == title[..1]);

    if let Some(index) = low {
        let mut high = dataset
            .iter()
            .rposition(|b| b.title[..1] == title[..1])
            .unwrap();
        let mut unwrapped_low = index;
        while unwrapped_low <= high {
            let mid = (unwrapped_low + high) / 2;
            if dataset[mid].title == title {
                return Some(mid);
            } else if dataset[mid].title < title {
                unwrapped_low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        Some(unwrapped_low)
    } else {
        None
    }
}
fn create_cover(book_directory: String, write_directory: &String) -> String {
    use rand::Rng;

    let mut rng = rand::thread_rng();

    let random_num = rng.gen_range(0..=10000).to_string();
    let cover_path = format!("{}/covers/{}.jpg", &write_directory, random_num);
    let doc = EpubDoc::new(&book_directory);
    let mut doc = doc.unwrap();
    if let Some(cover) = doc.get_cover() {
        let cover_data = cover.0;
        let f = fs::File::create(&cover_path);
        let mut f = f.unwrap();
        if let Err(err) = f.write_all(&cover_data) {
            eprintln!("Failed to write cover data: {:?}", err);
        }
    }

    return cover_path;
}

#[tauri::command(rename_all = "snake_case")]
fn base64_encode_file(file_path: &str) -> Result<String, String> {
    let mut buffer = Vec::new();

    let mut file = match File::open(&file_path) {
        Ok(file) => file,
        Err(_) => {
            match File::open(
                env::current_exe()
                    .expect("Failed to get current executable path")
                    .parent()
                    .expect("Failed to get parent directory")
                    .join("error.jpg"),
            ) {
                Ok(file) => file,
                Err(err) => {
                    panic!("Failed to open error.jpg: {}", err,);
                }
            }
        }
    };

    match file.read_to_end(&mut buffer) {
        Ok(_) => (),
        Err(err) => return Err(format!("Failed to read file: {}", err)),
    };

    // Encode the file data as base64
    let base64_data = encode(&buffer);
    Ok(base64_data)
}
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            create_covers,
            base64_encode_file,
            load_book
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
