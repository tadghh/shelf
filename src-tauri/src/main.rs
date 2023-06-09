#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
use base64::{engine::general_purpose, Engine as _};
use epub::doc::EpubDoc;
use rayon::{prelude::*, vec};

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs::{File, OpenOptions};
use std::io::{BufRead, BufReader, Read, Seek, SeekFrom, Write};
use std::path::Path;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::{Arc, Mutex};
use std::time::Instant;
use std::{env, fs};

#[derive(Serialize, Deserialize, Debug)]
struct Book {
    cover_location: String,
    book_location: String,
    title: String,
}

struct BookCache {
    books: Vec<Book>,
    json_path: String,
}

impl BookCache {
    fn update_path(&mut self, new_json_path: String) {
        self.json_path = new_json_path;
    }
    fn update_books(&mut self, new_books: Vec<Book>) {
        self.books = new_books;
    }
}

static mut BOOK_JSON: BookCache = BookCache {
    books: Vec::new(),
    json_path: String::new(),
};

static CACHE_FILE_NAME: &'static str = "book_cache.json";
static SETTINGS_FILE_NAME: &'static str = "shelf_settings.conf";
static COVER_IMAGE_FOLDER_NAME: &'static str = "cover_cache";

#[derive(Serialize, Deserialize, Debug)]
enum Settings {
    ENDLESS_SCROLL,
    BOOK_LOCATION,
}
#[derive(Serialize, Deserialize, Debug)]
enum temp {
    Settings,
    String,
}
#[tauri::command]
fn shelf_settings_health() -> HashMap<String, String> {
    // this is making me sad
    //I have a list of keys I will know exist
    // I know what type these keys should be
    enum ItemValue {
        StringValue(String),
        BoolValue(bool),
        FloatValue(f64),
    }
    struct SettingsItem {
        item_key: String,
        default_value: ItemValue,
    }
    let expected_keys = vec![
        SettingsItem {
            item_key: "book_folder_location".to_string(),
            default_value: ItemValue::StringValue("E:\\Books\\Book\\Epub".to_string()),
        },
        SettingsItem {
            item_key: "endless_scroll".to_string(),
            default_value: ItemValue::BoolValue(false),
        },
    ];
    //check if settings file exists
    // Oh theres a file? lets verify the values
    // map over the file comparing agaisnt expected keys
    // if the value is good leave it otherwise use the default
    //if not create it
    let mut map = HashMap::new();
    map.insert(
        String::from("ENDLESS_SCROLL"),
        String::from("endless_scroll"),
    );
    map.insert(
        String::from("BOOK_LOCATION"),
        String::from("book_folder_location"),
    );
    return map;
    // loop through list of settings and itialize default key and vals
}
#[tauri::command]
fn shelf_setup() {
    //file name to long
    shelf_settings_health();
    //if it does load it?
}

#[tauri::command]
fn create_covers() -> Option<Vec<Book>> {
    //file name to long
    let start_time = Instant::now();

    let mut file_changes = false;

    //Get rust directory
    let home_dir = &env::current_dir()
        .unwrap()
        .to_string_lossy()
        .replace("\\", "/");

    let json_path = format!("{}/{}", &home_dir, &CACHE_FILE_NAME);
    let dir = match get_configuration_option("book_folder_location".to_string()) {
        Some(val) => val,
        None => "".to_string(),
    };
    if dir == "null".to_string() || dir == "".to_string() {
        return None;
    }
    let paths = fs::read_dir(&dir);

    //Load epubs from the provided directory in the frontend, currently the dashboards component
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

    let mut book_json: Vec<Book>;

    //We need this folder to load cover images, otherwise images need to base64 encoded and thats to hacky
    let public_directory = create_directory(home_dir, &"cache".to_owned());
    let covers_directory = create_directory(
        &public_directory.to_string(),
        &COVER_IMAGE_FOLDER_NAME.to_owned(),
    );

    unsafe {
        if BOOK_JSON.json_path != json_path {
            BOOK_JSON.update_path(format!("{}", json_path));
        }
    }

    if Path::new(&json_path).exists() {
        let file = OpenOptions::new()
            .read(true)
            .write(true)
            .create(true)
            .open(&json_path);
        println!("{:?}", json_path);
        book_json = match serde_json::from_reader(BufReader::new(file.unwrap())) {
            Ok(data) => data,
            Err(_) => Vec::new(),
        };
        let book_json_len = Arc::new(AtomicUsize::new(book_json.len()));

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
                    cover_location: create_cover(item_normalized.to_string(), &covers_directory),
                    book_location: item_normalized,
                    title: title.clone(),
                };
                book_json_guard.insert(index.unwrap(), new_book);
                book_json_len.fetch_sub(1, Ordering::SeqCst);
            }
        });

        book_json = Arc::try_unwrap(book_json_test)
            .unwrap()
            .into_inner()
            .unwrap();
        let final_length = book_json_len.load(Ordering::SeqCst);

        //if the lengths are dff bool it
        if book_json.len() != final_length {
            file_changes = true;
        }
    } else {
        book_json = create_book_vec(&epubs, &covers_directory);
        file_changes = true;
    }
    if file_changes {
        let file = File::create(json_path).expect("Json path should be defined and a valid path");

        serde_json::to_writer_pretty(file, &book_json).expect("The book json file should exist")
    }

    let elapsed_time = start_time.elapsed();
    println!("Execution time: {} ms", elapsed_time.as_millis());

    return Some(book_json);
}
#[tauri::command]
fn load_book(title: String) -> Result<String, String> {
    unsafe {
        let open_file: &String = &BOOK_JSON.json_path.to_owned();
        println!("{:?}", Path::new(&open_file).exists());
        println!("{:?}", &BOOK_JSON.json_path);
        if Path::new(&open_file).exists() {
            let file = OpenOptions::new()
                .read(true)
                .write(true)
                .create(true)
                .open(&open_file);

            BOOK_JSON.update_books(
                match serde_json::from_reader(BufReader::new(file.unwrap())) {
                    Ok(data) => data,
                    Err(_) => Vec::new(),
                },
            );
            //  println!("Yo Index {:?}", &BOOK_JSON.books.take());
            //Okay we have it but like dont steal the data perhaps?
            let temp = &BOOK_JSON.books;
            let book_index = chunk_binary_search_index_load(temp, &title);
            println!("yo");
            if let Some(book) = temp.get(book_index.unwrap()) {
                // Accessing the book at the specified index
                println!("{}", book.book_location.to_string());
                return Ok(base64_encode_book(&book.book_location.to_string()).unwrap());
            } else {
                println!("Invalid index");
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
    let cover_path = format!("{}/{}.jpg", &write_directory, random_num);
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
fn get_cover(book_title: String) -> Result<String, String> {
    unsafe {
        let open_file: &String = &BOOK_JSON.json_path.to_owned();

        if Path::new(&open_file).exists() {
            let file = OpenOptions::new()
                .read(true)
                .write(true)
                .create(true)
                .open(&open_file);

            BOOK_JSON.update_books(
                match serde_json::from_reader(BufReader::new(file.unwrap())) {
                    Ok(data) => data,
                    Err(_) => Vec::new(),
                },
            );

            let temp = &BOOK_JSON.books;
            let book_index = chunk_binary_search_index_load(temp, &book_title);
            println!("yo");
            if let Some(book) = temp.get(book_index.unwrap()) {
                return Ok(base64_encode_file(&book.cover_location.to_string()).unwrap());
            } else {
                println!("Invalid index");
            }
        } else {
            return Err("JSON File missing".to_string());
        }
    }
    return Err("Error occured".to_string());
}

#[tauri::command(rename_all = "snake_case")]
fn change_configuration_option(option_name: String, value: String) {
    let home_dir = &env::current_dir()
        .unwrap()
        .to_string_lossy()
        .replace("\\", "/");
    let settings_path = format!("{}/{}", home_dir, &SETTINGS_FILE_NAME);

    let mut file = OpenOptions::new()
        .create(true)
        .read(true)
        .write(true)
        .open(&settings_path)
        .unwrap();

    let mut lines = Vec::new();
    let mut updated = false;

    let reader = BufReader::new(&file);

    for line in reader.lines() {
        let line_content = line.unwrap();
        // println!("{:?} bull", &line_content);
        if line_content.starts_with(&option_name) {
            let updated_line = format!("{}={}", option_name, value);
            lines.push(updated_line);
            updated = true;
        } else {
            lines.push(line_content);
        }
    }

    if !updated {
        let new_line = format!("{}={}", option_name, value);
        lines.push(new_line);
    }

    let new_contents = lines.join("\n");
    let new_length = new_contents.len() as u64;

    file.seek(SeekFrom::Start(0)).unwrap();
    file.set_len(0).unwrap();
    file.write_all(new_contents.as_bytes()).unwrap();
    file.set_len(new_length).unwrap();
}

#[tauri::command(rename_all = "snake_case")]
fn get_configuration_option(option_name: String) -> Option<String> {
    //todo: when program first runs we should look for files like this and create them
    let home_dir = &env::current_dir()
        .unwrap()
        .to_string_lossy()
        .replace("\\", "/");
    let settings_path = format!("{}/{}", home_dir, &SETTINGS_FILE_NAME);
    println!("{:?}", &settings_path);
    let file = OpenOptions::new()
        .read(true)
        .write(true)
        .create(true)
        .open(&settings_path)
        .expect("The settings file should exist");

    let reader = BufReader::new(&file);

    for line in reader.lines() {
        let line_content = line.unwrap();

        if line_content.starts_with(&option_name) {
            let split: Vec<&str> = line_content.split("=").collect();
            return Some(split[1].to_string());
        }
    }
    change_configuration_option(option_name, "null".to_string());
    return None;
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

    file.read_to_end(&mut buffer)
        .expect("There was an issue with the buffer");

    // Encode the file data as base64
    let base64_data = general_purpose::STANDARD_NO_PAD.encode(&buffer);
    Ok(base64_data)
}
fn base64_encode_book(file_path: &str) -> Result<String, String> {
    let mut buffer = Vec::new();

    let mut file = match File::open(&file_path) {
        Ok(file) => file,
        Err(_) => {
            match File::open(
                env::current_exe()
                    .expect("Failed to get current executable path")
                    .parent()
                    .expect("Failed to get parent directory"),
            ) {
                Ok(file) => file,
                Err(err) => {
                    panic!("Failed to error: {}", err,);
                }
            }
        }
    };

    match file.read_to_end(&mut buffer) {
        Ok(_) => (),
        Err(err) => return Err(format!("Failed to read file: {}", err)),
    };

    // Encode the file data as base64
    let base64_data = general_purpose::STANDARD.encode(&buffer);
    //println!("yo {:?}", base64_data);
    Ok(base64_data)
}
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            create_covers,
            base64_encode_file,
            load_book,
            change_configuration_option,
            get_configuration_option,
            get_cover,
            shelf_settings_health
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

//This creates the vector to be written to the json file
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

//Checks if a directory exists and if not its path is created
fn create_directory(path: &String, new_folder_name: &String) -> String {
    let created_dir = Path::new(&path).join(new_folder_name);
    if !Path::new(&created_dir).exists() {
        if let Err(err) = std::fs::create_dir_all(&created_dir) {
            eprintln!("Failed to create folder: {}", err);
        }
    }
    return created_dir.to_string_lossy().replace("\\", "/");
}
