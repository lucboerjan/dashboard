<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('internetlinks', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignID('groepID');
            $table->string('url',200)->default('');
            $table->string('omschrijving',200)->default('');
            $table->integer('volgorde');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('internetlinks');
    }
};
