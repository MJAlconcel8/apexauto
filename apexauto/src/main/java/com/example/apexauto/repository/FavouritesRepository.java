package com.example.apexauto.repository;

import com.example.apexauto.entity.Favourites;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FavouritesRepository extends JpaRepository<Favourites, Integer> {

}
